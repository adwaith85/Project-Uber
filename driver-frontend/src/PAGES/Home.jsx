import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import CurrentLocationMap from "../Components/CurrentLocationMap";
import DriverStore from "../Store/DriverStore";
import RiderReqMessage from "../Components/RiderReqMessage";
import AllRideDetails from "../Components/AllRideDetails";
import RideAnalyticsChart from "../Components/RideAnalyticsChart";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";

function Home() {
  const socketRef = useRef(null);
  const [ridenotify, Setridenotify] = useState(false);
  const [rideData, SetrideData] = useState({});

  const token = DriverStore((state) => state.token);

  // Fetch rides ONE TIME here
  const { data: rideList, isLoading, error } = useQuery({
    queryKey: ["rides"],
    queryFn: async () => {
      const res = await api.get("/ridedetails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current.id);
    });

    socketRef.current.on("ride:alert", (msg) => {
      SetrideData(msg);
      Setridenotify(true);

      setTimeout(() => Setridenotify(false), 25000);
    });

    return () => socketRef.current.disconnect();
  }, []);

  return (
    <>
      <div className="flex flex-col bg-gray-100 text-gray-900">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-3 space-y-6">
          <div className="w-[100%]">
            <CurrentLocationMap socketRef={socketRef} />
          </div>

          <div className="md:w-[50%] md:top-3">
            {ridenotify && (
              <RiderReqMessage ride={rideData} socketRef={socketRef} />
            )}
          </div>
        </main>

        {/* Ride Table */}
        <div className="relative bg-gray-100 w-full h-[80%] mx-auto mb-10 rounded-xl shadow-lg overflow-hidden">
          {!isLoading && rideList && <AllRideDetails rides={rideList} />}
        </div>

        {/* 🎉 Added Chart Here */}
        <div className="md:absolute md:top-12 md:w-[370px] p-1 ">
          {!isLoading && rideList && (
            <RideAnalyticsChart rides={rideList} />
          )}
        </div>
      </div>


    </>
  );
}

export default Home;
