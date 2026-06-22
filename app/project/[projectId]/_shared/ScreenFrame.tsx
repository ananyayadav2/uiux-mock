"use client";
<<<<<<< HEAD

=======
>>>>>>> main
import { themeToCssVars, THEMES } from '@/data/Themes';
import { ProjectType } from '@/type/type';
import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

interface ScreenFrameProps {
  screen: any;
  x: number;
  y: number;
  width: number;
  height: number;
  setPanningEnable: (enable: boolean) => void;
  projectDetail: ProjectType | undefined;
}

export default function ScreenFrame({ screen, x, y, width, height, setPanningEnable, projectDetail }: ScreenFrameProps) {
  const [size, setSize] = useState({ width, height });
  
  const settingData = projectDetail; 

  const selectedTheme = settingData?.theme as any;
  // @ts-ignore
  const theme = THEMES[selectedTheme];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
    <style>
    ${themeToCssVars(projectDetail?.theme)}
    </style>
    </head>
    <body class="bg-[var(--background)] text-[var(--foreground)] w-full">
    ${screen.code ?? ""}
    </body>
    </html>
  `;

  return (
    <Rnd
      default={{
        x: x,
        y: y,
        width: size.width,
        height: size.height,
      }}
      minWidth={200}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="drag-handle"
      enableResizing={{
        bottom: true,
        bottomRight: true,
        right: true,
      }}
      onDragStart={() => setPanningEnable(false)}
      onDragStop={() => setPanningEnable(true)}
      onResizeStart={() => setPanningEnable(false)}
      onResizeStop={(e, direction, ref, delta, position) => {
        setPanningEnable(true);
        setSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
    >
      <div className="bg-white rounded-2xl p-4 shadow-xl border w-full h-full flex flex-col">
        <div className="drag-handle bg-gray-100 rounded-xl p-2 mb-2 cursor-move flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-500">
            {screen.screenName || "Screen"}
          </span>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden bg-gray-50 border relative">
          <iframe
            srcDoc={html}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
          <div className="flex-1 rounded-xl overflow-hidden bg-gray-50 border relative">
  <iframe
    // Make sure you are using the 'html' variable we constructed!
    srcDoc={html} 
    className="w-full h-full border-none"
    // Keep these sandbox attributes for now
    sandbox="allow-scripts allow-same-origin"
  />
</div>
        </div>
      </div>
    </Rnd>
  );
}