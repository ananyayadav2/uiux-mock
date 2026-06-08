"use client";
import React from 'react';
import Header from '@/app/_shared/Header'; // Changed from project-header to match your actual file structure
import Hero from '@/app/_shared/Hero';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
    return (
        <div>
            <Header />
            <div className="flex h-screen">
                <div className="w-1/4 border-r">
                    {/* Settings Section */}
                </div>
                <div className="w-3/4 bg-gray-100">
                    {/* Canvas Component */}
                </div>
            </div>
        </div>
    );
}