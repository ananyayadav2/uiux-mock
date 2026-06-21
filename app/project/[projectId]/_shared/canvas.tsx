"use client";

import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ScreenFrame from './ScreenFrame';
import { Plus, Minus, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Ensure this path matches your shadcn setup

interface CanvasProps {
  projectDetail: any;
  screenConfig: any[];
}

export default function Canvas({ projectDetail, screenConfig }: CanvasProps) {
  const [panningEnable, setPanningEnable] = useState(true);

  const isMobile = projectDetail?.device === 'mobile';

  const screenWidth = isMobile ? 200 : 500;
  const screenHeight = 800;
  const gap = 20;

  return (
    <div className="w-full h-[90vh] bg-gray-100 relative overflow-hidden">
      <TransformWrapper
        initialScale={0.7}
        minScale={0.3}
        maxScale={3}
        panning={{ disabled: !panningEnable }}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <React.Fragment>
            {/* Floating Zoom Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg border">
              <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
                <Plus className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => zoomOut()}>
                <Minus className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => resetTransform()}>
                <MousePointer2 className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div
                className="w-full h-full relative"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {screenConfig.map((screen, index) => {
                  const xPos = index * (screenWidth + gap) + 50;

                  return (
                    <ScreenFrame
                      key={index}
                      screen={screen}
                      x={xPos}
                      y={50}
                      width={screenWidth}
                      height={screenHeight}
                      setPanningEnable={setPanningEnable}
                      projectDetail={projectDetail}
                    />
                  );
                })}
              </div>
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
}