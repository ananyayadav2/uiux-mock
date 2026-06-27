import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { projectsTable,  ScreenConfigTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { and, eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { userInput, device } = await req.json();
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (!userEmail) {
          return NextResponse.json({ error: "Unable to resolve user email" }, { status: 400 });
        }

        const projectId = uuidv4();

        // Ensure these keys (projectId, name, userInput, device, userId) 
        // match the columns defined in config/schema.tsx
        const result = await db.insert(projectsTable).values({
            projectId: projectId,
            name: "New Project",
            userInput: userInput,
            device: device,
            userId: userEmail,
        }).returning({ projectId: projectsTable.projectId });

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error("Project creation error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message }, 
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
  const projectId = await req.nextUrl.searchParams.get('projectId');
  const user = await currentUser();

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  if (!userEmail) {
    return NextResponse.json({ error: "Unable to resolve user email" }, { status: 400 });
  }

  try {
    const result = await db.select().from(projectsTable)
      .where(and(eq(projectsTable.projectId, projectId), eq(projectsTable.userId, userEmail)));

      const Screenconfig=await db.select().from(ScreenConfigTable)
      .where(eq(ScreenConfigTable.projectId, projectId))

    return NextResponse.json({
    projectDetail: result[0],
    screenConfig: Screenconfig,
    screenconfig: Screenconfig
    });
  } catch (e) {
  console.error("DEBUG API ERROR:", e); // This will log the REAL error to your terminal
  return NextResponse.json({ msg: String(e) }); 
}
  }
