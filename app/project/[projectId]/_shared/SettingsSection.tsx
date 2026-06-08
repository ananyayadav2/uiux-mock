"use client"
import { Textarea } from '@/components/ui/textarea'
import { THEME_NAME_LIST, THEMES } from '@/data/Themes'
import { Button, Input } from '@base-ui/react'
import { console } from 'inspector'
import { Camera, Share, Sparkles } from 'lucide-react'
import { Cambo } from 'next/font/google'
import React, { useState } from 'react'

function SettingsSection() {

const [selectecTheme, setselectedTheme]=useState('AURORA_INK');
const [projectName, setProjectName]=useState('');
const [userNewScreenInput, setUserNewScreenInput]=useState<string>();

  return (
    <div className='w-[300px] h-{90vh] p-5 border-r'>
    <h2 className='font-medium text-lg'>Settings</h2>
      
    <div className='mt-3'>
    <h2 className='text-sm mb-1'>Project Name</h2>
    <Input placeholder='Project Name' 
    onChange={(event)=>setProjectName(event.target.value)}
    />
    </div>

    <div className='mt-5'>
    <h2 className='text-sm mb-1'>Generate New Screen</h2>
    <Textarea placeholder='Enter Prompt to Generate screen using AI' 
     onChange={(event)=>setUserNewScreenInput(event.target.value)}
    />
    <Button size={'sm'} className='mt-2 w-full' > <Sparkles/> Generate with AI  </Button>
    </div> 

    <div className='mt-5'>
      <h2 className='text-sm mb-1'>Themes</h2>
     <div className='h-[200px] overflow-auto' >
       <div>
        {THEME_NAME_LIST.map((theme,index) => (
        <div className={`p-3 border rounded-xl mb-2
         ${theme==selectecTheme&&'border-primary bg-primary/20'}
        `}
        onClick={()=>setselectedTheme(theme)}>

          <h2> {theme} </h2>

          <div className='flex gap-2'>
            <div className={'h-4 w-4 rounded-full '}
            style={{background: THEMES[theme].primary}}
            />

            <div className={'h-4 w-4 rounded-full '}
            style={{background: THEMES[theme].secondary}}
            />

            <div className={'h-4 w-4 rounded-full '}
            style={{background: THEMES[theme].accent}}
            />

            <div className={'h-4 w-4 rounded-full '}
            style={{background: THEMES[theme].background}}
            />

          <div
  className="h-4 w-4 rounded-full"
  style={{
    background: `linear-gradient(
      135deg,
      ${THEMES[theme].background},
      ${THEMES[theme].primary},
      ${THEMES[theme].accent}
    )`,
  }}
/>

            </div>

        </div>
       ))}
          </div>

        </div>
      </div>  
       <div className='mt-5'>
    <h2 className='text-sm mb-1'>Extras</h2>
    <div className='flex gap-3'>
    <Button size={'sm'} variant={'outline'} className='mt-2 ' > <Camera/> Screenshot </Button>
    <Button size={'sm'} variant={'outline'} className='mt-2 ' > <Share/> Share </Button>
    </div>
    </div> 
    </div>
  )
}

export default SettingsSection