import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import CurrentLocationMap from "../Components/CurrentLocationMap";
import DriverStore from "../Store/DriverStore";
import { useMutation } from "@tanstack/react-query"
import api from "../api/axiosClient";



function Home() {

  const token = DriverStore((state) => state.token)
  const locationMutation = useMutation({
    mutationFn: async (formdata) => {
      return await api.put("/updatelocation", formdata, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onSuccess: () => {
      console.log("location updated successfully")
    },
    onError: (error) => {
      console.error("error updating location", error.message)
    },
  })

  const updateLocation = () => {
    if (!navigator.geolocation) {
      console.warn("geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        }
        locationMutation.mutate({ location })
      },
      (error) => {
        console.error("failed to get location", error)
      }
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateLocation()
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="w-[95%] ">
          <CurrentLocationMap />
        </div>
      </main>
    </div>
  );
}

export default Home;
