import React, { useEffect, useRef, useState } from "react";
import {
  CloudArrowDownIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
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
  const driverName = DriverStore((state) => state.user?.name) || "Driver";

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar is sticky by default in the component, just render it */}
      <Navbar />

      {/* Content */}
      <div className="relative z-10 flex flex-col mb-20">
        <main className="flex-1">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {getGreeting()}, {driverName} <span className="text-2xl">👋</span>
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                  Ready to hit the road? Here's your dashboard overview.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <h5 className="w-5 h-5 mb-2 text-blue-600">●</h5>
                <span className="text-blue-700 font-medium">You're online and visible</span>
              </div>
            </div>

            {/* Map Section */}
            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Live Map</h2>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                  ● Live Updating
                </span>
              </div>
              <div className="h-96 w-full p-4 relative">
                <CurrentLocationMap socketRef={socketRef} />
              </div>
            </div>

            {/* Ride Notification */}
            {ridenotify && (
              <div className=" z-50 w-full max-w-md">
                <RiderReqMessage ride={rideData} socketRef={socketRef} />
              </div>
            )}

            {/* Grid Layout for Chart and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart - Left Side */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Earnings Overview</h2>
                  <p className="text-sm text-gray-500">Your performance this week</p>
                </div>
                <div className="p-4 flex-1 flex items-center justify-center bg-gray-50/50">
                  {!isLoading && rideList ? (
                    <RideAnalyticsChart rides={rideList} />
                  ) : (
                    <div className="h-64 w-full flex items-center justify-center text-gray-400">
                      Loading chart...
                    </div>
                  )}
                </div>
              </div>

              {/* Rides Table - Right Side */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <p className="text-sm text-gray-500">Latest ride requests and trips</p>
                  </div>
                </div>
                <div className="p-2">
                  {!isLoading && rideList && <AllRideDetails rides={rideList} enableSorting={false} limit={6} showViewAllLink={true} />}
                  {isLoading && (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-500 text-sm">Loading rides...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">

          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Driver Support</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We're here to help you succeed. Access resources, troubleshooting guides, and 24/7 support.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center gap-3 text-sm">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" /> support@example.com
              </p>
              <p className="flex items-center gap-3 text-sm">
                <PhoneIcon className="h-5 w-5 text-gray-400" /> +1 (800) 123-4567
              </p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition">LinkedIn</a>
            </div>
          </div>

        </div>

        <div className="text-center text-gray-400 text-sm mt-12 pt-8 border-t border-gray-100">
          © {new Date().getFullYear()} Driver App. All rights reserved.
        </div>
      </footer>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Home;
