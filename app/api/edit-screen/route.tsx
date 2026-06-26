import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { projectId, screenId, userInput, oldCode } = await req.json();

    const prompt = `You are a Lead UI/UX Developer.
Make changes in this code keeping the overall design and style the same. Do not change the core layout unless requested.
Make user requested changes: ${userInput}

CRITICAL IMAGE RULE: Never use external image domains like images.unsplash.com or pravatar.cc. For EVERY <img> tag, you must strictly use 'https://placeholder.co/...'

Old code:
${oldCode}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "UIUX Mockup Generator"
      },
      body: JSON.stringify({
        model: "openrouter/free", 
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await response.json();

    // SAFETY CHECK 1: Did OpenRouter send back an explicit error?
    if (aiData.error) {
      console.error("OPENROUTER API ERROR:", aiData.error);
      return NextResponse.json({ error: aiData.error.message || "AI Provider Error" }, { status: 500 });
    }

    // SAFETY CHECK 2: Is the choices array missing?
    if (!aiData.choices || aiData.choices.length === 0) {
      console.error("UNEXPECTED AI RESPONSE:", aiData);
      return NextResponse.json({ error: "Invalid response from AI provider." }, { status: 500 });
    }

    let newCode = aiData.choices[0].message.content;

    // FIX: Robust Markdown Extraction (Solves the quotes/backticks issue!)
    const codeMatch = newCode.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    if (codeMatch) {
      newCode = codeMatch[1]; // Extracts only the code inside the backticks
    } else {
      // Fallback cleanup just in case
      newCode = newCode.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
    }

    // Update the database
    const result = await db.update(ScreenConfigTable)
      .set({ code: newCode })
      .where(
        and(
          eq(ScreenConfigTable.projectId, projectId),
          eq(ScreenConfigTable.screenId, screenId)
        )
      )
      .returning();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error editing screen:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}