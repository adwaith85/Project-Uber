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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "4s"}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Map Section */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/30 transition">
              <div className="bg-gray-800/30 p-4">
                <CurrentLocationMap socketRef={socketRef} />
              </div>
            </div>

            {/* Ride Notification */}
            {ridenotify && (
              <div className="sticky top-20 z-40 animate-slide-down">
                <RiderReqMessage ride={rideData} socketRef={socketRef} />
              </div>
            )}

            {/* Grid Layout for Chart and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chart - Left Side */}
              <div className="lg:col-span-1 h-fit rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden hover:border-orange-500/30 transition">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-4">
                  {!isLoading && rideList && (
                    <RideAnalyticsChart rides={rideList} />
                  )}
                </div>
              </div>

              {/* Rides Table - Right Side */}
              <div className="lg:col-span-3 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden hover:border-orange-500/30 transition">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40">
                  {!isLoading && rideList && <AllRideDetails rides={rideList} />}
                  {isLoading && (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <p className="mt-4 text-gray-400">Loading rides...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;
