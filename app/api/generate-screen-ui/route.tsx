import { NextRequest, NextResponse } from "next/server";
import { openrouter } from "@/config/openrouter";
import { ScreenConfigTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq, and } from "drizzle-orm";
import { GENERATe_Screen_PROMPT} from "@/data/Prompt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, screenId, screenName, purpose, screenDescription } = body;

    if (!projectId || !screenId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Format the user input with the screen details from the body
    const userInput = `Screen Name: ${screenName}\nScreen Purpose: ${purpose}\nScreen Layout Description: ${screenDescription}`;

    // 2. Call the AI Model
    const response = await openrouter.chat.send({
      chatRequest: {
        model: "openrouter/free", 
        messages: [
          {
            role: "system",
            content: GENERATe_Screen_PROMPT
          },
          { role: "user", content: userInput }
        ],
      },
    });

    let rawContent = response.choices?.[0]?.message?.content || "";

    // 3. Clean up markdown syntax if the AI wraps the code in markdown blocks
    let generatedCode = rawContent
      .replaceAll("```html", "")
      .replaceAll("```", "")
      .trim();

    // 4. Update the database record with the newly generated HTML code
    const updateResult = await db.update(ScreenConfigTable)
      .set({ code: generatedCode })
      .where(
        and(
          eq(ScreenConfigTable.screenId, screenId),
          eq(ScreenConfigTable.projectId, projectId)
        )
      ).returning();

    // 5. Return the generated code to the frontend
    return NextResponse.json({ code: generatedCode });

  } catch (error: any) {
    console.error("Critical failure in POST /api/generate-screen-ui:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}