import React, { useRef } from "react";
import Navbar from "./Navbar";
import { Pencil } from "lucide-react";
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


  console.log("User data from API:", data);

  if (isLoading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error loading data</p>;


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Profile Card */}
      <div className="flex justify-center items-start pt-8 px-4 flex-1">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md transition-all duration-300 hover:shadow-xl">

          {/* Profile Image Section */}
          <div className="relative flex flex-col items-center">
            <img
              src={data?.profileimg || "https://via.placeholder.com/120"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
            />

            {/* Edit Icon Overlay */}
            <button
              // onClick={handleImageClick}
              className="absolute bottom-0 right-[calc(50%-56px)] bg-black text-white p-1.5 rounded-full hover:bg-gray-800 transition"
            >
              <Link to="/UpdateProfile">
                <Pencil className="w-4 h-4" /></Link>
            </button>

            <input
              type="file"
              accept="image/*"
              // ref={fileInputRef}
              // onChange={handleImageChange}
              className="hidden"
            />

            <h2 className="mt-4 text-2xl font-semibold text-gray-900">{data?.name ?? "not found"}</h2>
            <p className="text-gray-500 text-sm">Driver</p>
          </div>

          {/* User Details with edit buttons */}
          <div className="mt-8 space-y-4">
            {/* Name */}
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="text-gray-900 font-medium">{data?.name ?? "not found"}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Link to="/UpdateName"><Pencil className="w-4 h-4 text-gray-600" /></Link>
              </button>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-gray-900 font-medium">{data?.email ?? "not found"}</p>
              </div>
              {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Pencil className="w-4 h-4 text-gray-600" />
              </button> */}
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-gray-600 text-sm">Car-Type</p>
                <p className="text-gray-900 font-medium">{data?.cartype ?? "not found"}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Link to="/updatecartype"><Pencil className="w-4 h-4 text-gray-600" /></Link>
              </button>
            </div>

            {/* Phone Number */}
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-gray-600 text-sm">Phone Number</p>
                <p className="text-gray-900 font-medium">+91 {data?.number ?? "not found"}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Link to="/UpdateNumber"><Pencil className="w-4 h-4 text-gray-600" /></Link>
              </button>
            </div>

            {/* Car Number */}
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-gray-600 text-sm">Car Number</p>
                <p className="text-gray-900 font-medium">{data?.carnumber ?? "not found"}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Link to="/UpdateNumber"> <Pencil className="w-4 h-4 text-gray-600" /></Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
