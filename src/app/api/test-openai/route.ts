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

import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: "What is 1 + 1?",
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        console.log("Gemini response:", data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Gemini test error:", error);

        return NextResponse.json(
            {
                error: String(error),
            },
            { status: 500 }
        );
    }
}