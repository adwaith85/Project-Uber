import React, { useState } from "react";
import DriverStore from "../Store/DriverStore";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";

function AllRideDetails() {
  const token = DriverStore((state) => state.token);
  const [sortType, setSortType] = useState("none");

  const { data, isLoading, error } = useQuery({
    queryKey: ["rides"],
    queryFn: async () => {
      const res = await api.get("/ridedetails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  if (isLoading)
    return <p className="text-center mt-4 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center mt-4 text-red-500">Error loading data</p>;

  // Sorting Logic
  let sortedData = [...data];

  if (sortType === "date") {
    sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  if (sortType === "completed") {
     sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    sortedData = sortedData.filter((r) => r.status === "completed");
  }

  return (
    <div className="max-w-full mx-auto mt-2 px-4">
      <h2 className="text-xl font-bold text-center">
        All Ride Details
      </h2>

      {/* SORT BUTTONS */}
      <div className="flex items-center gap-2 justify-center my-2 ">
        <button
          onClick={() => setSortType("date")}
          className=" px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sort by Date
        </button>

        <button
          onClick={() => setSortType("completed")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Completed Only
        </button>

        <button
          onClick={() => setSortType("none")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Reset
        </button>
      </div>

      {/* SCROLLABLE CONTAINER */}
      <div className="h-[300px] md:w-full overflow-y-auto shadow-lg border rounded-lg">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-gray-900 text-white sticky top-0">
            <tr className="">
              <th className="p-3 border">Driver ID</th>
              <th className="p-3 border">Pickup</th>
              <th className="p-3 border">Dropoff</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Time</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {sortedData.map((ride, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 transition cursor-pointer"
              >
                <td className="p-1 border text-sm text-center">{ride.driverId}</td>
                <td className="p-3 border text-sm text-center">{ride.pickup}</td>
                <td className="p-3 border text-sm text-center">{ride.dropoff}</td>
                <td className="p-3 border text-sm text-center">{ride.date}</td>
                <td className="p-3 border text-sm text-center">{ride.time}</td>
                <td
                  className={`p-3 border text-center text-sm font-semibold ${
                    ride.status === "completed"
                      ? "text-green-600"
                      : ride.status === "cancelled"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {ride.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllRideDetails;
