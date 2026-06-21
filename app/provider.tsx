"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserDetailContext } from '@/context/UserDetailContext'
import { SettingContext } from '@/context/SettingContext'

function Provider({ children }: any) {
  // Existing User State
  const [userDetails, setUserDetails] = useState()
  
  // New Setting State
  const [settingDetail, setSettingDetail] = useState<any>()

  useEffect(()=>{
    CreateNewUser();
  },[])

  const CreateNewUser=async()=>{
    const result=await axios.post('/api/user',{});
    console.log(result.data);
    setUserDetails(result?.data);
  }

  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      <SettingContext.Provider value={{ settingDetail, setSettingDetail }}>
        <div>{children}</div>
      </SettingContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default Provider