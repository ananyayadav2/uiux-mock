"use client";

import React, { useContext, useState } from 'react';
import { Code, Camera, Sparkles, MoreVertical, Copy, Trash, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SettingContext } from '@/context/SettingContext';
import axios from 'axios';

export default function ScreenHandler({ screen }: { screen: any }) {
  const { settingDetail } = useContext(SettingContext);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(screen?.code || "");
    toast.success("Code copied to clipboard!");
  };

  const onDelete = async () => {
    if (!settingDetail?.projectId || !screen?.screenId) {
        toast.error("Missing project or screen ID");
        return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/api/project?projectId=${settingDetail.projectId}&screenId=${screen.screenId}`);
      toast.success("Screen deleted successfully");
      
      // Force a hard reload to fetch the updated screen list
      window.location.reload(); 
    } catch (error) {
      toast.error("Failed to delete screen");
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="drag-handle flex items-center justify-between w-full bg-gray-100 rounded-xl p-2 mb-2 cursor-move">
      {/* Left Side: Drag Indicator / Screen Name */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">
          || Drag Here
        </span>
        <span className="text-sm font-semibold text-gray-600 ml-2">
          {screen?.screenName || "Screen"}
        </span>
      </div>

      {/* Right Side: Toolbar Options */}
      <div className="flex items-center gap-1">
        
        {/* 1. View Code */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Code className="w-4 h-4 text-gray-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>HTML & Tailwind CSS Code</DialogTitle>
              <DialogDescription>
                You can copy and use this code in your own project.
              </DialogDescription>
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

        {/* 2. Screenshot Placeholder */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Camera className="w-4 h-4 text-gray-500" />
        </Button>

        {/* 3. Edit/Regenerate Placeholder */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sparkles className="w-4 h-4 text-gray-500" />
        </Button>

        {/* 4. Dropdown Menu with Delete */}
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