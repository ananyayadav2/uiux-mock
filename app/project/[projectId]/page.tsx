"use client";
import React, { useEffect, useState } from 'react';
import ProjectHeader from './_shared/ProjectHeader';
import SettingsSection from './_shared/SettingsSection';
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

  // Changed screens type to any[] to safely accept both DB and AI JSON formats
  const generateScreenUIUX = async (screens: any[]) => {
    setLoading(true);
    for (let index = 0; index < screens.length; index++) {
      const screen = screens[index];

      if (screen.code) {
        continue;
      }

      setLoadingMsg(`Generating screen ${index + 1} of ${screens.length}...`);

      try {
        const result = await axios.post('/api/generate-screen-ui', {
          projectId: projectId,
          // THE FIX: Fallback to the AI JSON keys if the DB keys aren't present yet!
          screenId: screen.screenId || screen.id,
          screenName: screen.screenName || screen.name,
          purpose: screen.purpose,
          screenDescription: screen.screenDescription || screen.layoutDescription
        });

        setScreenConfig((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, code: result.data.code } : item
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

      console.log(result.data);
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

      setProjectDetail(data.projectDetail);
      setScreenConfig(data.screenConfig);

      if (!data.screenConfig || data.screenConfig.length === 0) {
        await generateScreenConfig(data.projectDetail);
      } else {
        generateScreenUIUX(data.screenConfig);
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
        {!loading && <SettingsSection />}
      </div>
    </div>
  );
}