"use client"
import Sidebar from "@/components/global/Sidebar";
import axios from "axios";
import { useEffect } from "react";

export default function LandingPage(){

  async function saveUser(){
    const response = await axios.post('/api/user');
    if(!response){
      return <h1>Something Went Wrong</h1>
    }
  }

  useEffect(()=>{
    const user = saveUser()
    console.log(user)
  }, [])


  return (
    <Sidebar />
  );
}