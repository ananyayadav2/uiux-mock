"use client";

import html2canvas from 'html2canvas';
import { themeToCssVars, THEMES } from '@/data/Themes';
import { ProjectType } from '@/type/type';
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Rnd } from 'react-rnd';
import { SettingContext } from '@/context/SettingContext';
import ScreenHandler from './ScreenHandler';

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
  
  // 1. WE ONLY CONTROL SIZE NOW. Position is 100% free.
  const [size, setSize] = useState({ width, height });
  
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const context = useContext(SettingContext);
  const settingDetail = context?.settingDetail;

  const currentTheme = settingDetail?.theme || projectDetail?.theme || 'AURORA_INK';
  const theme = THEMES[currentTheme as keyof typeof THEMES] || THEMES['AURORA_INK'];

  const measureIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const headerH = 40; 
      const htmlEl = doc.documentElement;
      const body = doc.body;

      const contentH = Math.max(
        htmlEl?.scrollHeight ?? 0,
        body?.scrollHeight ?? 0,
        htmlEl?.offsetHeight ?? 0,
        body?.offsetHeight ?? 0
      );

      const next = Math.min(Math.max(contentH + headerH, 160), 2000);

      setSize((s) => (Math.abs(s.height - next) > 2 ? { ...s, height: next } : s));
    } catch {
      // Ignore cross-origin issues
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      measureIframeHeight();

      const doc = iframe.contentDocument;
      if (!doc) return;

      const observer = new MutationObserver(() => measureIframeHeight());
      observer.observe(doc.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      const t1 = window.setTimeout(measureIframeHeight, 50);
      const t2 = window.setTimeout(measureIframeHeight, 200);
      const t3 = window.setTimeout(measureIframeHeight, 600);

      return () => {
        observer.disconnect();
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    };

    iframe.addEventListener("load", onLoad);
    window.addEventListener("resize", measureIframeHeight);

    return () => {
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("resize", measureIframeHeight);
    };
  }, [measureIframeHeight, screen?.code]);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://code.iconify.design/iconify-icon/1.0.0/iconify-icon.min.js"></script>
      <style>
        ${themeToCssVars(theme)}
      </style>
    </head>
    <body class="bg-[var(--background)] text-[var(--foreground)] w-full">
      ${screen?.code ?? ""}
    </body>
    </html>
  `;

  return (
    <Rnd
    
      // 3. NO BOUNDS. NO POSITION STATE. Let it roam free.
      size={{ width: size.width, height: size.height }}
      default={{
        x: x || 0,
        y: y || 0,
        width: width,
        height: height,
      }}
      minWidth={200}
      minHeight={200}
      dragHandleClassName="drag-handle"
      enableResizing={{
        bottom: true,
        bottomRight: true,
        right: true,
      }}
      onDragStart={() => {
        setPanningEnable(false);
        document.body.classList.add('is-dragging');
      }}
      onDragStop={() => {
        setPanningEnable(true);
        document.body.classList.remove('is-dragging');
      }}
      onResizeStart={() => {
        setPanningEnable(false);
        document.body.classList.add('is-dragging');
      }}
      onResize={(e, direction, ref) => {
        setSize({
          width: Number(ref.offsetWidth),
          height: Number(ref.offsetHeight),
        });
      }}
      onResizeStop={(e, direction, ref) => {
        setPanningEnable(true);
        document.body.classList.remove('is-dragging');
        setSize({
          width: Number(ref.offsetWidth),
          height: Number(ref.offsetHeight),
        });
      }}
    >
      <div className="bg-white rounded-2xl p-4 shadow-xl border w-full h-full flex flex-col">
        
        <ScreenHandler screen={screen} />

        <div id={`screen-container-${screen.screenId}`} className="flex-1 rounded-xl overflow-hidden bg-gray-50 border relative">
          <iframe 
            ref={iframeRef}
            srcDoc={html} 
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

    </Rnd>
    
  );
}