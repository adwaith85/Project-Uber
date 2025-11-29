import React, { useEffect, useRef, useState } from "react";
import {
  CloudArrowDownIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
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
    <div className="min-h-screen bg-white text-black">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80  rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80  rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80  rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col mb-20">
        <div className="stick z-40">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-4">
            {/* Map Section */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/30 transition">
              <div className="bg-gray-200 p-1">
                <CurrentLocationMap socketRef={socketRef} />
              </div>
            </div>

            {/* Ride Notification */}
            {ridenotify && (
              <div className="z-30 top-30">
                <RiderReqMessage ride={rideData} socketRef={socketRef} />
              </div>
            )}

            {/* Grid Layout for Chart and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chart - Left Side */}
              <div className="lg:col-span-1 h-fit rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm overflow-hidden hover:border-black transition">
                <div className="bg-gray-200 p-1">
                  {!isLoading && rideList && (
                    <RideAnalyticsChart rides={rideList} />
                  )}
                </div>
              </div>

              {/* Rides Table - Right Side */}
              <div className="lg:col-span-3 rounded-2xl shadow-2xl border border-gray-70 backdrop-blur-sm overflow-hidden hover:border-black transition">
                <div className="w-full m-2 ">
                  {!isLoading && rideList && <AllRideDetails rides={rideList} enableSorting={false} limit={6} showViewAllLink={true} />}
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
      <footer className="bg-gray-900 text-gray-200 py-8 ">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold">About Support</h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              We provide driver downloads, troubleshooting help, and device support for all users.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="mt-3 space-y-2 text-gray-300">
              <p className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5" /> support@example.com
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5" /> +1 (800) 123-4567
              </p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-3 space-x-4 text-gray-300">
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
            </div>
          </div>

        </div>

        <div className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Driver Support. All rights reserved.
        </div>
      </footer>

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
