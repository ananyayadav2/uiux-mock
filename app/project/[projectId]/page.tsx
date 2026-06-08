"use client";
import React from 'react';
import Header from '@/app/_shared/Header'; // Changed from project-header to match your actual file structure
import Hero from '@/app/_shared/Hero';
import ProjectHeader from './_shared/ProjectHeader';
import SettingsSection from './_shared/SettingsSection';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
    return (
       <div>
                        <ProjectHeader />

                        <div>
                            {/* Settings */}
                            <SettingsSection/>
                            {/* Canvas */}
                        </div>
                        </div>
    );
}