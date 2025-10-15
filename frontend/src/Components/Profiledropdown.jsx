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
} from "lucide-react";
import UserStore from "../Store/UserStore";
import api from "../Api/Axiosclient";

function Profiledropdown() {
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

  if (isLoading)
    return <p className="text-center mt-4 text-gray-600">Loading...</p>;
  if (error)
    return <p className="text-center mt-4 text-red-500">Error loading data</p>;

  return (
    <div className="relative inline-block text-left">
      {/* Profile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full"
      >
        <span>{data?.name || user?.name || "Profile"}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border p-4 z-50">
          {/* User info */}
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <div>
              <h3 className="font-bold text-lg">
                {data?.name || "User"}
              </h3>
            </div>
            <div className="w-[43px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center">
              <img
                src={data?.profileimg || "https://via.placeholder.com/80"}
                alt=""
                className="rounded-full w-20 h-11 object-cover overflow-hidden"
              />
              {/* <User className="w-6 h-6 text-gray-500" /> */}
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
              <HelpCircle className="w-6 h-6 mb-1" />
              <span className="text-sm">Help</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
              <Wallet className="w-6 h-6 mb-1" />
              <span className="text-sm">Wallet</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
              <BookOpen className="w-6 h-6 mb-1" />
              <span className="text-sm">Activity</span>
            </button>
          </div>

          {/* Menu options */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate("/AccountManager")}
              className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg"
            >
              <User className="w-5 h-5" />
              <span>Manage account</span>
            </button>

            <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg">
              <Car className="w-5 h-5" />
              <span>Ride</span>
            </button>

            <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg">
              <Truck className="w-5 h-5" />
              <span>Drive & deliver</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="w-full h-[3rem] text-red-500 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profiledropdown;
