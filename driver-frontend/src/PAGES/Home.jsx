import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import CurrentLocationMap from "../Components/CurrentLocationMap";


function Home() {
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <Navbar/>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="">
        <CurrentLocationMap/>
      </div>
      </main>
    </div>
  ); 
}

export default Home;
