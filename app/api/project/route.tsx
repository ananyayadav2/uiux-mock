import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { projectsTable, ScreenConfigTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { and, eq } from 'drizzle-orm';
import { User } from 'lucide-react';
import { strict } from 'assert';

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

export async function GET(req: NextRequest) {
    const projectId = await req.nextUrl.searchParams.get('projectId');
    const user = await currentUser();

    try {
        const result = await db.select().from(projectsTable)
            .where(and(eq(projectsTable.projectId, projectId as string), eq(projectsTable.userId, user?.primaryEmailAddress?.emailAddress as string)));

        const Screenconfig = await db.select().from(ScreenConfigTable)
            .where(eq(ScreenConfigTable.projectId, projectId as string));

        return NextResponse.json({
            projectDetail: result[0],
            screenConfig: Screenconfig
        });
    } catch (e) {
        console.error("DEBUG API ERROR:", e); // This will log the REAL error to your terminal
        return NextResponse.json({ msg: String(e) });
    }
}

export async function DELETE(req: NextRequest) {
    const projectId = req.nextUrl.searchParams.get('projectId');
    const screenId = req.nextUrl.searchParams.get('screenId');

    try {
        if (!projectId || !screenId) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const result = await db.delete(ScreenConfigTable)
            .where(
                and(
                    eq(ScreenConfigTable.projectId, projectId),
                    eq(ScreenConfigTable.screenId, screenId)
                )
            );

        return NextResponse.json({ message: "Screen deleted successfully", result });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId, projectName, theme } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const result = await db.update(projectsTable)
            .set({
                name: projectName, // Maps frontend 'projectName' to database 'name'
                theme: theme
            })
            .where(eq(projectsTable.projectId, projectId))
            .returning();

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}