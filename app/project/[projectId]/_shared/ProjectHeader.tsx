"use client";

import { Button } from '@/components/ui/button';
import { Save, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { SettingContext } from '@/context/SettingContext';
import axios from 'axios';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProjectHeader() {
  const context = useContext(SettingContext);
  const settingDetail = context?.settingDetail;
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!settingDetail?.projectId) {
      toast.error("Project ID missing!");
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/project', {
        projectId: settingDetail.projectId,
        projectName: settingDetail.projectName || settingDetail.name, 
        theme: settingDetail.theme
      });
      toast.success("Project saved successfully!");
    } catch (error) {
      toast.error("Failed to save project.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-between p-3 shadow-sm px-6 bg-white'>
      <Link href="/">
        <div className='flex gap-2 items-center cursor-pointer hover:opacity-80 transition-opacity'>
          <Image src={'/logo1.png'} alt='logo' width={40} height={40} />
          <h2 className='text-xl font-bold text-gray-800'>UIUX MOCK</h2>
        </div>
      </Link>
      
      <div>
        <Button 
          onClick={onSave} 
          disabled={loading} 
          className="flex gap-2 bg-red-500 hover:bg-red-600 text-white"
        >
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}