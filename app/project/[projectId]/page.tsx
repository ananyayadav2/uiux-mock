"use client";
import React, { useEffect, useState } from 'react';
import ProjectHeader from './_shared/ProjectHeader';
import SettingsSection from './_shared/SettingsSection';
import Canvas from './_shared/canvas';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ProjectType, ScreenConfig } from '@/type/type';
import { Loader2Icon } from 'lucide-react';

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };

  const [projectDetail, setProjectDetail] = useState<ProjectType | undefined>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMsg, setLoadingMsg] = useState<string>('Loading...');

  const generateScreenUIUX = async (screens: any[]) => {
    setLoading(true);

    if (!screens?.length) {
      setLoading(false);
      return;
    }

    const normalizedScreens = screens.map((screen) => ({
      ...screen,
      screenId: screen.screenId || screen.id,
      screenName: screen.screenName || screen.name,
      screenDescription: screen.screenDescription || screen.layoutDescription,
      code: screen.code || ''
    }));

    setScreenConfig(normalizedScreens);

    for (let index = 0; index < normalizedScreens.length; index++) {
      const screen = normalizedScreens[index];

      if (screen.code) {
        continue;
      }

      setLoadingMsg(`Generating screen ${index + 1} of ${normalizedScreens.length}...`);

      try {
        const result = await axios.post('/api/generate-screen-ui', {
          projectId: projectId,
          screenId: screen.screenId || screen.id,
          screenName: screen.screenName || screen.name,
          purpose: screen.purpose,
          screenDescription: screen.screenDescription || screen.layoutDescription,
          userInput: screen.purpose || `Generate a polished UI for ${screen.screenName || screen.name || 'this screen'}`,
          oldCode: screen.code || ''
        });

        const generatedCode = result.data?.code || result.data?.result?.[0]?.code || '';

        setScreenConfig((prev) =>
          prev.map((item) =>
            (item.screenId || item.id) === (screen.screenId || screen.id)
              ? { ...item, code: generatedCode }
              : item
          )
        );
      } catch (e) {
        console.error("Error generating screen UI:", e);
      }
    }
    setLoading(false);
  };

  const generateScreenConfig = async (detail: ProjectType) => {
    setLoadingMsg('Generating Screen Config...');
    setLoading(true);
    try {
      const result = await axios.post('/api/generate-config', {
        projectId: projectId,
        deviceType: detail?.device || 'desktop',
        userInput: detail?.userInput || 'Generate a standard dashboard layout'
      });

      setScreenConfig(result.data.screens); 
      
      setProjectDetail((prev: any) => ({
        ...prev,
        projectName: result.data.projectName,
        projectVisualDescription: result.data.projectVisualDescription,
        theme: result.data.theme
      }));

      generateScreenUIUX(result.data.screens);

    } catch (e) {
      console.error("Generation error:", e);
      setLoading(false);
    } 
  };

  const GetProjectDetails = async () => {
    setLoading(true);
    setLoadingMsg('Loading project...');
    try {
      const result = await axios.get('/api/project?projectId=' + projectId);
      const data = result.data;

      const screenList = data.screenConfig || data.screenconfig || [];

      setProjectDetail(data.projectDetail);
      setScreenConfig(screenList);

      if (!screenList || screenList.length === 0) {
        await generateScreenConfig(data.projectDetail);
      } else {
        generateScreenUIUX(screenList);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      GetProjectDetails();
    }
  }, [projectId]);

  return (
    <div>
      <ProjectHeader />
      <div className="relative">
        {loading && (
          <div className="p-3 absolute bg-blue-300/20 border-b-blue-600 rounded-xl left-1/2 top-20 z-50">
            <h2 className="flex gap-2 items-center">
              <Loader2Icon className="animate-spin" /> {loadingMsg}
            </h2>
          </div>
        )}
        
        {/* Main Content Layout */}
        <div className="flex w-full">
          {!loading && <SettingsSection />}
          
          {/* Canvas Section */}
          <div className="flex-1">
            {!loading && screenConfig.length > 0 && (
              <Canvas projectDetail={projectDetail} screenConfig={screenConfig} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}