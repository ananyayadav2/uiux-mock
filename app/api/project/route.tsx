import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { projectsTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { userInput, device } = await req.json();
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projectId = uuidv4();

        // Ensure these keys (projectId, name, userInput, device, userId) 
        // match the columns defined in config/schema.tsx
        const result = await db.insert(projectsTable).values({
            projectId: projectId,
            name: "New Project",
            userInput: userInput,
            device: device,
            userId: user.primaryEmailAddress?.emailAddress as string,
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