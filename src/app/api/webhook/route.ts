import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
    CallEndedEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallTranscriptionReadyEvent
} from "@stream-io/node-sdk";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { generateAgentToken, streamVideo } from "@/lib/stream-video";
import { createRealtimeClient } from "@stream-io/openai-realtime-api";
import { inngest } from "@/inngest/client";

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
                    // eq(meetings.status, "upcoming")
                    not(eq(meetings.status, "completed")),
                    not(eq(meetings.status, "active")),
                    not(eq(meetings.status, "cancelled")),
                    not(eq(meetings.status, "processing")),
                )
            )

        console.log("[WEBHOOK] Database query result - Meeting found:", existingMeeting);

        if (!existingMeeting) {
            return NextResponse.json({ status: "ok" });
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

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        const call = streamVideo.video.call("default", meetingId);
        // const realtimeClient = await streamVideo.video.connectOpenAi({
        //     call,
        //     openAiApiKey: process.env.OPENAI_API_KEY!,
        //     agentUserId: existingAgent.id,
        // });

        // realtimeClient.updateSession({
        //     instructions: existingAgent.instructions,
        // });
        // Generate agent token with backdated iat to avoid JWT clock-skew errors.
        // connectOpenAi() doesn't expose iat, so we replicate its internals here.
        const agentToken = generateAgentToken(existingAgent.id, call.cid);
        const realtimeClient = createRealtimeClient({
            baseUrl: "https://video.stream-io-api.com",
            call,
            streamApiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            streamUserToken: agentToken,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            model: "gpt-4o-realtime-preview"
        });
        await realtimeClient.connect();

        realtimeClient.updateSession({
            instructions: existingAgent.instructions,
            voice: "alloy",
            modalities: ["audio", "text"],
            turn_detection: {
                type: "server_vad",
                silence_duration_ms: 500,
                prefix_padding_ms: 300,
                threshold: 0.5,
            },
            input_audio_transcription: {
                model: "whisper-1",
            },
        });
    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1]; // call_cid is formatted as "type:id"
        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 })
        }

        const call = streamVideo.video.call("default", meetingId);
        await call.end();

    } else if (eventType === "call.session_ended") {

        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 })
        }

        await db
            .update(meetings)
            .set({
                status: "processing",
                endedAt: new Date(),
            })
            .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));

    } else if (eventType === "call.transcription_ready") {

        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1]; // call_cid is formatted as "type:id"
        console.log("transcript payload:", payload)
        const [updatedMeeting] = await db
            .update(meetings)
            .set({
                transcriptUrl: event.call_transcription.url,
            })
            .where(eq(meetings.id, meetingId))
            .returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
        }

        await inngest.send({
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl,
            },
        });
    } else if (eventType === "call.recording_ready") {

        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1]; // call_cid is formatted as "type:id"

        await db
            .update(meetings)
            .set({
                recordingUrl: event.call_recording.url,
            })
            .where(eq(meetings.id, meetingId));

    }
    console.log("[WEBHOOK] Webhook processed successfully");
    return NextResponse.json({ status: "ok" })
}