"use client";

import React, { useState, useContext, useEffect } from 'react';
import { THEME_NAME_LIST, THEMES } from '@/data/Themes';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SettingContext } from '@/context/SettingContext';

interface SettingsSectionProps {
  projectDetail?: any;
}

export default function SettingsSection({ projectDetail }: SettingsSectionProps) {
  const { settingDetail, setSettingDetail } = useContext(SettingContext);

  // FIX 1: Look for projectDetail.name instead of projectName
  const [selectedTheme, setSelectedTheme] = useState(settingDetail?.theme || projectDetail?.theme || 'AURORA_INK');
  const [projectName, setProjectName] = useState(settingDetail?.projectName || projectDetail?.name || '');
  const [userNewScreenInput, setUserNewScreenInput] = useState('');

  // FIX 2: Push the loaded data (including projectId!) into the global context
  useEffect(() => {
    if (projectDetail) {
      const fetchedName = projectDetail.name || '';
      const fetchedTheme = projectDetail.theme || 'AURORA_INK';

      setProjectName(fetchedName);
      setSelectedTheme(fetchedTheme);

      setSettingDetail((prev: any) => ({
        ...prev,
        projectId: projectDetail.projectId,
        projectName: fetchedName,
        theme: fetchedTheme
      }));
    }
  }, [projectDetail, setSettingDetail]);

  const handleProjectNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setProjectName(val);
    setSettingDetail((prev: any) => ({
      ...prev,
      projectName: val
    }));
  };

  const onThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setSettingDetail((prev: any) => ({
      ...prev,
      theme: theme
    }));
  };

  return (
    <div className="p-5 w-[300px] h-[90vh] border-r">
      <h2 className="font-medium text-lg">Settings</h2>

      {/* Project Name Input */}
      <div className="mt-3">
        <h2 className="text-sm mb-1">Project Name</h2>
        <Input
          placeholder="Project Name"
          value={projectName}
          onChange={handleProjectNameChange}
        />
      </div>

      {/* Generate New Screen */}
      <div className="mt-5">
        <h2 className="text-sm mb-1">Generate New Screen</h2>
        <Textarea
          placeholder="Enter Prompt to Generate screen using AI"
          value={userNewScreenInput}
          onChange={(event) => setUserNewScreenInput(event.target.value)}
        />
        <Button size="sm" className="mt-2 w-full">
          <Sparkles className="mr-2 w-4 h-4" /> Generate with AI
        </Button>
      </div>

      {/* Themes Section */}
      <div className="mt-5">
        <h2 className="text-sm mb-1">Themes</h2>
        <div className="h-[200px] overflow-auto">
          {THEME_NAME_LIST.map((theme, index) => (
            <div
              key={index}
              className={`p-3 border rounded-xl mb-2 cursor-pointer ${theme === selectedTheme ? 'border-primary bg-primary/20' : ''}`}
              onClick={() => onThemeSelect(theme)}
            >
              <h2 className="font-semibold">{theme}</h2>
              <div className="flex gap-2 mt-2">
                <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme as keyof typeof THEMES].primary }}></div>
                <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme as keyof typeof THEMES].secondary }}></div>
                <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme as keyof typeof THEMES].accent }}></div>
                <div className="h-4 w-4 rounded-full" style={{ background: THEMES[theme as keyof typeof THEMES].background }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className="mt-5">
        <h2 className="text-sm mb-1">Extras</h2>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" className="mt-2">
            <Camera className="mr-2 w-4 h-4" /> Screenshot
          </Button>
          <Button size="sm" variant="outline" className="mt-2">
            <Share className="mr-2 w-4 h-4" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}