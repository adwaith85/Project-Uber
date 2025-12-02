import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  User,
  HelpCircle,
  Wallet,
  BookOpen,
  Car,
  Truck,
  LogOut,
} from "lucide-react";
import UserStore from "../Store/UserStore";
import api from "../Api/Axiosclient";

function Profiledropdown({ isMobile = false, onClose }) {
  const logout = UserStore((state) => state.logout);
  const user = UserStore((state) => state.user);
  const token = UserStore((state) => state.token);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user details with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const res = await api.get("/GetDetails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    enabled: !!token, // only run if token exists
  });

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate("/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
    setIsOpen(false);
  };

  if (isLoading)
    return <p className="text-center text-gray-600 text-sm">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 text-sm">Error loading profile</p>;

  // Mobile View - Simplified
  if (isMobile) {
    return (
      <div className="w-full">
        {/* User info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src={data?.profileimg || "https://via.placeholder.com/80"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{data?.name || "User"}</h3>
            <p className="text-sm text-gray-600">{data?.email || ""}</p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
            <HelpCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Help</span>
          </button>
          <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
            <Wallet className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Wallet</span>
          </button>
          <button
            onClick={() => handleNavigate("/ridehistory")}
            className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            <BookOpen className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Activity</span>
          </button>
        </div>

        {/* Menu options */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleNavigate("/AccountManager")}
            className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition text-left"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Manage account</span>
          </button>

          <button className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition text-left">
            <Car className="w-5 h-5" />
            <span className="font-medium">Ride</span>
          </button>

          <button className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-lg transition text-left">
            <Truck className="w-5 h-5" />
            <span className="font-medium">Drive & deliver</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 bg-red-50 hover:bg-red-100 p-3 rounded-lg transition text-red-600 font-medium text-left mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop View - Dropdown
  return (
    <div className="relative inline-block text-left">
      {/* Profile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md"
      >
        <span className="font-medium">{data?.name || user?.name || "Profile"}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />

          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
            {/* User info */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg">{data?.name || "User"}</h3>
                <p className="text-sm text-gray-600">{data?.email || ""}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={data?.profileimg || "https://via.placeholder.com/80"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <HelpCircle className="w-6 h-6 mb-1 text-gray-700" />
                <span className="text-xs font-medium">Help</span>
              </button>
              <button className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <Wallet className="w-6 h-6 mb-1 text-gray-700" />
                <span className="text-xs font-medium">Wallet</span>
              </button>
              <button
                onClick={() => handleNavigate("/ridehistory")}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <BookOpen className="w-6 h-6 mb-1 text-gray-700" />
                <span className="text-xs font-medium">Activity</span>
              </button>
            </div>

            {/* Menu options */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleNavigate("/AccountManager")}
                className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg transition text-left"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="font-medium">Manage account</span>
              </button>

              <button className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg transition text-left">
                <Car className="w-5 h-5 text-gray-700" />
                <span className="font-medium">Ride</span>
              </button>

              <button className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg transition text-left">
                <Truck className="w-5 h-5 text-gray-700" />
                <span className="font-medium">Drive & deliver</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-lg font-semibold transition mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profiledropdown;
