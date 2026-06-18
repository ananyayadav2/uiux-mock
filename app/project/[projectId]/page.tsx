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

  const generateScreenConfig = async (detail: ProjectType) => {
    setLoadingMsg('Generating Screen Config...');
    setLoading(true);
    try {
      // Data sent flat to match the destructuring in route.ts
      const result = await axios.post('/api/generate-config', {
        projectId: projectId,
        deviceType: detail?.device || 'desktop',
        userInput: detail?.userInput || 'Generate a standard dashboard layout'
      });

      // 1. THIS IS WHAT YOU WERE MISSING! Print it to the console exactly like the tutorial:
      console.log(result.data);

      // 2. Properly separate the data into your React states
      // We only want the array of screens in this state variable
      setScreenConfig(result.data.screens); 
      
      // 3. Update the project details so your UI (like the selected theme) updates immediately!
      setProjectDetail((prev: any) => ({
        ...prev,
        projectName: result.data.projectName,
        projectVisualDescription: result.data.projectVisualDescription,
        theme: result.data.theme
      }));

    } catch (e) {
      console.error("Generation error:", e);
    } finally {
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
        setLoading(false);
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
