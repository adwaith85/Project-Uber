import React, { useState } from "react";
import DriverStore from "../Store/DriverStore";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import Navbar from "./Navbar";
import moment from "moment";

function AllRideDetails({ rides }) {
  const token = DriverStore((state) => state.token);
  const [sortType, setSortType] = useState("none");

  const { data, isLoading, error } = useQuery({
    queryKey: ["rides"],
    queryFn: async () => {
      const res = await api.get("/ridedetails", {
        headers: {
          Authorization: `Bearer ${token}`
        },
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
    sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  if (sortType === "completed") {
    sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedData = sortedData.filter((r) => r.status === "completed");
  }

  return (
    <div className="max-w-full mx-auto mt-2 ">

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
      {/* SCROLLABLE & RESPONSIVE TABLE */}
      <div className="h-[300px] w-full overflow-y-auto overflow-x-hidden shadow-lg border rounded-lg">
        <table className="w-full text-[10px] md:text-xs table-fixed">
          <thead className="bg-gray-900 text-white sticky top-0 text-[10px] md:text-xs">
            <tr>
              {/* <th className="p-2 w-16">Driver</th> */}
              <th className="p-2 w-15">Pickup</th>
              <th className="p-2 w-15">Dropoff</th>
              <th className="p-2 w-15">Date</th>
              <th className="p-2 w-15">Time</th>
              <th className="p-2 w-13">Km</th>
              <th className="p-2 w-16">Rate</th>
              <th className="p-2 w-20">Status</th>
            </tr>
          </thead>

          <tbody>
            {sortedData.map((ride, index) => {
              const pickupShort =
                ride.pickup?.split(" ")[0] +
                (ride.pickup?.split(" ").length > 1 ? "..." : "");

              const dropoffShort =
                ride.dropoff?.split(" ")[0] +
                (ride.dropoff?.split(" ").length > 1 ? "..." : "");

              return (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition cursor-pointer border-b"
                >
                  {/* <td className="p-2 text-center truncate ">{ride.driverId}

            </td> */}

                  <td className="p-2 text-center truncate">{pickupShort}</td>

                  <td className="p-2 text-center truncate">{dropoffShort}</td>

                  <td className="p-2 text-center">
                    {moment(ride.date).format("DD MMM, YYYY")}
                  </td>

                  <td className="p-2 text-center truncate">
                    {moment(ride.time).format("hh:mm A")}
                  </td>

                  <td className="p-2 text-center truncate">
                    {ride.distance} km
                  </td>

                  <td className=" text-center truncate">
                    ₨.{ride.price}
                  </td>

                  <td
                    className={` text-center font-semibold  whitespace-nowrap truncate ${ride.status === "completed"
                      ? "text-green-600"
                      : ride.status === "cancelled"
                        ? "text-red-600"
                        : ride.status === "accepted"
                          ? "text-blue-600"
                          : "text-black"
                      }`}
                  >
                    {ride.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

  );
}

export default AllRideDetails;
