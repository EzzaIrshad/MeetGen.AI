// export async function GET() {
//     // const response = await fetch("https://api.openai.com/v1/responses", {
//     const response = await fetch("https://models.github.ai/inference", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             input: "What is 1+1?"
//         }),
//     });

//     const data = await response.json();
//     return Response.json(data);
// }

// =---------------------gemini key test---------------------------

// import { NextResponse } from "next/server";

// export async function GET() {
//     try {
//         const response = await fetch(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     contents: [
//                         {
//                             parts: [
//                                 {
//                                     text: "What is 1 + 1?",
//                                 },
//                             ],
//                         },
//                     ],
//                 }),
//             }
//         );

//         const data = await response.json();

//         console.log("Gemini response:", data);

//         return NextResponse.json(data);
//     } catch (error) {
//         console.error("Gemini test error:", error);

//         return NextResponse.json(
//             {
//                 error: String(error),
//             },
//             { status: 500 }
//         );
//     }
// }

// ------------GROQ TEST------------------
// import { NextResponse } from "next/server";
// import { createAgent, openai } from "@inngest/agent-kit";

// export async function GET() {
//     const summarizer = createAgent({
//         name: "summarizer",
//         system: "Summarize meetings.",
//         model: openai({
//             model: "openai/gpt-oss-120b",
//             apiKey: process.env.GROQ_API_KEY!,
//             baseUrl: "https://api.groq.com/openai/v1",
//         }),
//     });

//     const { output } = await summarizer.run(
//         "Summarize: Today we discussed authentication and payments."
//     );

//     return NextResponse.json({
//         summary: output[0],
//     });
// }

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function GET() {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
            { error: "GROQ_API_KEY is not set" },
            { status: 500 }
        );
    }

    try {
        const response = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: "Reply with one short sentence confirming Groq is working.",
                },
            ],
            temperature: 0.2,
        });

        return NextResponse.json({
            ok: true,
            reply: response.choices[0]?.message?.content ?? "",
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// -------------INNGEST TEST-----------------
// import { createAgent, openai } from "@inngest/agent-kit";
// import dotenv from "dotenv";

// dotenv.config();

// const summarizer = createAgent({
//     name: "summarizer",
//     system: `
// You are an expert meeting summarizer.

// Summarize the transcript into:
// - Overview
// - Key Notes
// - Action Items
//   `,
//     model: openai({
//         model: "openai/gpt-oss-120b",
//         apiKey: process.env.GROQ_API_KEY!,
//         baseUrl: "https://api.groq.com/openai/v1",
//     }),
// });

// async function main() {
//     const transcript = `
// John: Welcome everyone.
// Sarah: Today we'll discuss the new dashboard.
// John: We have improved performance by 40%.
// Sarah: Next sprint we'll add authentication.
// `;

//     const { output } = await summarizer.run(
//         `Summarize this transcript:\n${transcript}`
//     );

//     console.log(output[0]);
// }

// main();