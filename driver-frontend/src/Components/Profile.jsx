import React from "react";
import Navbar from "./Navbar";
import { Pencil, Edit3, Car, Phone, MapPin, Zap, User, Star, ShieldCheck } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import DriverStore from "../Store/DriverStore";
import { Link } from "react-router-dom";
import api from "../API/AxiosClient";

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <p className="text-red-500 font-medium">Error loading profile</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900"></div>
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={data?.profileimg || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                />
                <Link to="/UpdateProfile">
                  <button className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full hover:bg-black transition shadow-sm" title="Update Photo">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Name & Badges */}
              <div className="flex-1 text-center md:text-left mb-2">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-400">{data?.name ?? "Driver Name"}</h1>
                  <Link to="/UpdateName">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
                <p className="text-gray-500 font-medium mb-1">Professional Driver</p>
                <div className="flex gap-3 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 md:gap-8 mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 w-full md:w-auto justify-center md:justify-end">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">250+</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rides</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">2.5y</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Exp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" /> Personal Details
            </h3>
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900 font-medium mt-0.5">{data?.email ?? "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-gray-900 font-medium mt-0.5">+91 {data?.number ?? "Not provided"}</p>
                  </div>
                </div>
                <Link to="/UpdateNumber">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Car className="w-5 h-5 text-gray-400" /> Vehicle Details
            </h3>
            <div className="space-y-6">
              {/* Car Type */}
              <div className="flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                    <p className="text-gray-900 font-medium mt-0.5 capitalize">{data?.cartype ?? "Not provided"}</p>
                  </div>
                </div>
                <Link to="/updatecartype">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Car Number */}
              <div className="flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                    <p className="text-gray-900 font-medium mt-0.5 uppercase">{data?.carnumber ?? "Not provided"}</p>
                  </div>
                </div>
                <Link to="/UpdateNumber">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Rate */}
              <div className="flex items-start justify-between group pt-4 border-t border-gray-100">
                <div className="flex gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rate per km</p>
                    <p className="text-gray-900 font-bold mt-0.5">₹{data?.distancerate ?? "0"}/km</p>
                  </div>
                </div>
                <Link to="/updatedistancerate">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper icon component since EnvelopeIcon was imported from heroicons in previous file but lucide is used here
function EnvelopeIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export default Profile;
