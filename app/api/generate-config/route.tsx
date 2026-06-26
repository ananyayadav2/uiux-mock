import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Bulletproof extraction: checks every possible variable name your frontend might send
    const projectId = body.projectId;
    const screenId = body.screenId;
    const promptInput = body.prompt || body.userInput || body.description || body.idea || "";

    const systemPrompt = `You are a Lead UI/UX Developer.
    Write the raw HTML and Tailwind CSS code for the following UI component based on the description.
    Do not include ANY explanations, intro text, or markdown formatting. Just output the raw HTML code.
    
    CRITICAL IMAGE RULE: Never use external image domains like images.unsplash.com or pravatar.cc. For EVERY <img> tag, you must strictly use 'https://placeholder.co/600x400'

    Description:
    ${promptInput}`;

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
        messages: [{ role: "user", content: systemPrompt }]
      })
    });

    const aiData = await response.json();

    if (aiData.error) {
      return NextResponse.json({ error: aiData.error.message }, { status: 500 });
    }

    if (!aiData.choices || aiData.choices.length === 0) {
      return NextResponse.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    let newCode = aiData.choices[0].message.content;

    // Perfectly strips the Markdown backticks so the code is visible
    const codeMatch = newCode.match(/
http://googleusercontent.com/immersive_entry_chip/0
http://googleusercontent.com/immersive_entry_chip/1

---

### 3. `app/project/[projectId]/_shared/ScreenHandler.tsx`

```tsx
"use client";
import React, { useState } from 'react';
import { Code, Camera, Sparkles, MoreVertical, Copy, Trash, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import domtoimage from 'dom-to-image';
import { useParams } from 'next/navigation';

export default function ScreenHandler({ screen }: { screen: any }) {
  const params = useParams();
  const projectId = params.projectId;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserInput, setEditUserInput] = useState("");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(screen?.code || "");
    toast.success("Code copied to clipboard!");
  };

  const onDelete = async () => {
    if (!projectId || !screen?.screenId) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/project?projectId=${projectId}&screenId=${screen.screenId}`);
      toast.success("Screen deleted successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete screen");
      setIsDeleting(false);
    }
  };

  const onEdit = async () => {
    if (!projectId || !screen?.screenId) return;
    if (!editUserInput.trim()) {
      toast.error("Please enter what changes you want to make.");
      return;
    }
    setIsEditing(true);
    toast.loading("Regenerating new screen, please wait...", { id: "edit-toast" });
    try {
      await axios.post("/api/edit-screen", {
        projectId: projectId,
        screenId: screen.screenId,
        userInput: editUserInput,
        oldCode: screen.code,
      });
      toast.success("Screen edited successfully!", { id: "edit-toast" });
      window.location.reload();
    } catch (error) {
      toast.error("Failed to edit screen", { id: "edit-toast" });
      setIsEditing(false);
    }
  };

  const downloadScreenshot = async () => {
    const element = document.getElementById(`screen-container-${screen?.screenId}`);
    if (!element) return toast.error("Couldn't find the screen to capture.");
    
    try {
      toast.loading("Capturing screenshot...", { id: "screenshot-toast" });
      const dataUrl = await domtoimage.toPng(element, { quality: 1, bgcolor: 'transparent' });
      const link = document.createElement('a');
      link.download = `${screen?.screenName || 'mockup'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Screenshot saved!", { id: "screenshot-toast" });
    } catch (err) {
      toast.error("Failed to capture screenshot", { id: "screenshot-toast" });
    }
  };

  return (
    <div className="flex items-center justify-between w-full bg-gray-100 rounded-xl p-2 mb-2">
      <div className="drag-handle flex items-center gap-2 cursor-move px-2 w-full">
        <span className="text-xs font-medium text-gray-400">|| Drag Here</span>
        <span className="text-sm font-semibold text-gray-600 ml-2">{screen?.screenName || "Screen"}</span>
      </div>

      <div className="flex items-center gap-1">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Code className="w-4 h-4 text-gray-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>HTML & Tailwind CSS Code</DialogTitle>
              <DialogDescription>You can copy and use this code in your own project.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto rounded-md bg-[#2f2f2f] relative mt-4">
              <Button size="sm" className="absolute top-4 right-4 z-10" onClick={handleCopyCode}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <SyntaxHighlighter language="html" style={materialDark} customStyle={{ margin: 0, padding: '20px', minHeight: '100%' }} wrapLongLines={true}>
                {screen?.code || "No code generated yet."}
              </SyntaxHighlighter>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadScreenshot}>
          <Camera className="w-4 h-4 text-gray-500" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sparkles className="w-4 h-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Edit Screen</p>
              <Textarea
                placeholder="What changes do you want to make?"
                value={editUserInput}
                onChange={(e) => setEditUserInput(e.target.value)}
                className="text-sm resize-none"
                rows={3}
              />
              <Button size="sm" onClick={onEdit} disabled={isEditing} className="w-full flex items-center gap-2">
                {isEditing ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Regenerate
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
              {isDeleting ? <Loader2Icon className="w-4 h-4 text-gray-500 animate-spin" /> : <MoreVertical className="w-4 h-4 text-gray-500" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600">
              <Trash className="w-4 h-4 mr-2" /> Delete Screen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}