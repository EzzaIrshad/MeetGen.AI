import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent
} from "@stream-io/node-sdk";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");
    console.log("[WEBHOOK] Received webhook request", { signature: !!signature, apiKey: !!apiKey });
    if (!signature || !apiKey) {
        return NextResponse.json(
            { error: "Missing signature or API key" },
            { status: 400 }
        )
    }
    console.log("[WEBHOOK] Signature verified successfully");

    const body = await req.text();

    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        )
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON payload" },
            { status: 400 }
        )
    }

    const eventType = (payload as Record<string, unknown>)?.type;
    console.log("[WEBHOOK] Event type:", eventType);
    
    if (eventType === "call.session_started") {
        console.log("[WEBHOOK] Processing call.session_started event");
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 })
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    not(eq(meetings.status, "completed")),
                    not(eq(meetings.status, "active")),
                    not(eq(meetings.status, "cancelled")),
                    not(eq(meetings.status, "processing")),
                )
            )

        console.log("[WEBHOOK] Database query result - Meeting found:", existingMeeting);

        if (!existingMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
        }

        await db
            .update(meetings)
            .set({
                status: "active",
                startedAt: new Date(),
            })
            .where(eq(meetings.id, existingMeeting.id));

        console.log("[WEBHOOK] Meeting status updated to active");

        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId));
        console.log("[WEBHOOK] Agent query result:", existingAgent);
        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        const call = streamVideo.video.call("default", meetingId);
        
        try {
            console.log("[WEBHOOK] About to call connectOpenAi");
            const realtimeClient = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey: process.env.OPENAI_API_KEY!,
                agentUserId: existingAgent.id,
            });
            console.log("[WEBHOOK] connectOpenAi succeeded");

            realtimeClient.updateSession({
                instructions: existingAgent.instructions,
            });
        } catch (error) {
            return NextResponse.json(
                { error: "Failed to connect OpenAI agent", details: String(error) },
                { status: 500 }
            );
        }
    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1]; // call_cid is formatted as "type:id"
        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 })
        }

        const call = streamVideo.video.call("default", meetingId);
        await call.end();
    }
    console.log("[WEBHOOK] Webhook processed successfully");
    return NextResponse.json({ status: "ok" })
}