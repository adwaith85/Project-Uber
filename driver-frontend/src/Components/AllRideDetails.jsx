import React, { useState } from "react";
import DriverStore from "../Store/DriverStore";
import { useQuery } from "@tanstack/react-query";
import api from "../API/AxiosClient";
import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import moment from "moment";

function AllRideDetails({ rides, enableSorting = true, limit = null, showViewAllLink = false }) {
  const token = DriverStore((state) => state.token);
  const [sortType, setSortType] = useState("none");
  const [expandedRideId, setExpandedRideId] = useState(null);

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
    sortedData.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first usually makes more sense
  }

  if (sortType === "completed") {
    sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    sortedData = sortedData.filter((r) => r.status === "completed");
  }

  // Limit logic
  if (limit) {
    // If limiting, usually we want the latest ones, so let's ensure we sort by date desc if no other sort is active
    if (sortType === "none") {
      sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    sortedData = sortedData.slice(0, limit);
  }

  const toggleExpand = (id) => {
    setExpandedRideId(expandedRideId === id ? null : id);
  };

  return (
    <div className="max-w-full mx-auto mt-2 px-4">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {limit ? `Latest Rides` : "All Ride Details"}
        </h2>
        {showViewAllLink && (
          <Link to="/tripspage" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-medium">
            View All <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* SORT BUTTONS */}
      {enableSorting && (
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
      )}

      {/* SCROLLABLE CONTAINER */}
      <div className="w-full overflow-hidden">
        <div className="hidden md:block"> {/* Desktop View */}
          <table className="w-full text-sm md:text-base border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-center">Details</th>
              </tr>
            </thead>

            <tbody>
              {sortedData.map((ride, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="hover:bg-gray-50 transition border-b border-gray-100"
                  >
                    <td
                      className={`p-3 font-semibold ${ride.status === "completed"
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
                    <td className="p-3 text-gray-600">{moment(ride.date).format("DD MMM YYYY")}</td>
                    <td className="p-3 text-gray-600">{moment(ride.time).format("h:mm A")}</td>
                    <td className="p-3 font-medium">₨.{ride.price}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleExpand(ride._id || index)}
                        className="p-1 hover:bg-gray-200 rounded-full transition"
                      >
                        {expandedRideId === (ride._id || index) ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedRideId === (ride._id || index) && (
                    <tr>
                      <td colSpan="5" className="p-0">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 animate-slide-down">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider">Pickup</p>
                              <p className="font-medium text-gray-800">{ride.pickup}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider">Dropoff</p>
                              <p className="font-medium text-gray-800">{ride.dropoff}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider">Distance</p>
                              <p className="font-medium text-gray-800">{ride.distance} km</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider">Ride ID</p>
                              <p className="font-medium text-gray-800">{ride._id}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-wider">Requested Date</p>
                              <p className="font-medium text-gray-800">{moment(ride.requestedAt).format("DD MMM YYYY, h:mm A")}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-3">
          {sortedData.map((ride, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 flex justify-between items-center" onClick={() => toggleExpand(ride._id || index)}>
                <div>
                  <div className={`font-bold text-sm ${ride.status === "completed" ? "text-green-600" : ride.status === "cancelled" ? "text-red-600" : "text-blue-600"}`}>
                    {ride.status}
                  </div>
                  <div className="text-xs text-gray-500 mt-1"> 
                    {moment(ride.date).format("DD MMM YYYY")} •{moment(ride.time).format("h:mm A")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">₨.{ride.price}</span>
                  <button className="text-gray-400">
                    {expandedRideId === (ride._id || index) ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedRideId === (ride._id || index) && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 text-sm space-y-3 animate-slide-down">
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Pickup</p>
                    <p className="font-medium">{ride.pickup}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Dropoff</p>
                    <p className="font-medium">{ride.dropoff}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Distance</p>
                      <p className="font-medium">{ride.distance} km</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase">Ride ID</p>
                      <p className="font-medium">{ride._id}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Requested Date</p>
                    <p className="font-medium">{moment(ride.requestedAt).format("DD MMM YYYY, h:mm A")}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>

  );
}

export default AllRideDetails;
