import React, { useRef } from "react";
import Navbar from "./Navbar";
import { Pencil, Edit3, Car, Phone, MapPin, Zap } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import DriverStore from "../Store/DriverStore";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";


function Profile() {
  const token = DriverStore((state) => state.token);

  const { data, isLoading, error } = useQuery({
    queryKey: ['driver'],
    queryFn: async () => {
      const res = await api.get('/Details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-center">Error loading profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white  text-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      <div className="relative z-10 flex flex-col">
        <Navbar />

        {/* Profile Content */}
        <div className="flex-1 flex justify-center items-start pt-8 px-4 md:px-6 py-12">
          <div className="w-full max-w-2xl">
            {/* Profile Header Card */}
            <div className="bg-gray-100 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl hover:border-black transition mb-8">
              
              {/* Profile Image Section */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="relative">
                  <img
                    src={data?.profileimg || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue shadow-lg"
                  />
                  <Link to="/UpdateProfile">
                    <button className="absolute bottom-0 right-0 bg-gray-300 text-black p-3 rounded-full hover:shadow-lg hover:shadow-blue transition transform hover:scale-110">
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </Link>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">{data?.name ?? "Not found"}</h2>
                  <p className="text-gray-900 text-lg mb-4">Professional Driver</p>
                  <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                    <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/50">
                      ⭐ Verified
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold border border-green-500/50">
                      ✓ Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="bg-gray-200 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-black transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Pencil className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-medium">Email Address</p>
                      <p className="text-gray-500 font-semibold">{data?.email ?? "Not found"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-gray-200 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-black transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Phone className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-medium">Phone Number</p>
                      <p className="text-gray-500 font-semibold">+91 {data?.number ?? "Not found"}</p>
                    </div>
                  </div>
                  <Link to="/UpdateNumber">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition">
                      <Pencil className="w-4 h-4 text-gray-400 hover:text-orange-400" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Car Type */}
              <div className="bg-gray-200 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-black transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Car className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-medium">Car Type</p>
                      <p className="text-gray-500 font-semibold">{data?.cartype ?? "Not found"}</p>
                    </div>
                  </div>
                  <Link to="/updatecartype">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition">
                      <Pencil className="w-4 h-4 text-gray-400 hover:text-orange-400" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Car Number */}
              <div className="bg-gray-200 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-black transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <MapPin className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-medium">Car Number</p>
                      <p className="text-gray-500 font-semibold">{data?.carnumber ?? "Not found"}</p>
                    </div>
                  </div>
                  <Link to="/UpdateNumber">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition">
                      <Pencil className="w-4 h-4 text-gray-400 hover:text-orange-400" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Distance Rate */}
              <div className="bg-gray-200 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 hover:border-black transition md:col-span-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-black text-sm font-medium">Rate Per Kilometer</p>
                      <p className="text-gray-500 font-semibold">₹{data?.distancerate ?? "Not found"}/km</p>
                    </div>
                  </div>
                  <Link to="/updatedistancerate">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition">
                      <Pencil className="w-4 h-4 text-gray-400 hover:text-orange-400" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-gray-300/40 to-gray-400/40 backdrop-blur-xl rounded-lg p-4 border border-gray-700/50 text-center">
                <p className="text-2xl font-bold text-orange-400">98%</p>
                <p className="text-gray-900 text-sm mt-1">Rating</p>
              </div>
              <div className="bg-gradient-to-br from-gray-300/40 to-gray-400/40 backdrop-blur-xl rounded-lg p-4 border border-gray-700/50 text-center">
                <p className="text-2xl font-bold text-green-400">250+</p>
                <p className="text-gray-900 text-sm mt-1">Rides</p>
              </div>
              <div className="bg-gradient-to-br from-gray-300/40 to-gray-400/40 backdrop-blur-xl rounded-lg p-4 border border-gray-700/50 text-center">
                <p className="text-2xl font-bold text-blue-400">3.2K</p>
                <p className="text-gray-900 text-sm mt-1">Earnings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
