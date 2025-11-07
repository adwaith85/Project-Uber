import React from "react";

const RideNotifyCard = ({ ride }) => {
  if (!ride) return null; // Safety check

  const { pickup, dropoff, time, date, rideId } = ride;

  return (
    <div className="max-w-md mx-auto my-4 bg-white border border-gray-200 rounded-xl shadow-md p-5 font-sans">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg mr-3">
          🚗
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          Ride Notification
        </h3>
      </div>

      {/* Ride details */}
      <div className="space-y-2 text-gray-700">
        <div>
          <span className="font-medium">Pickup:</span> {pickup}
        </div>
        <div>
          <span className="font-medium">Dropoff:</span> {dropoff}
        </div>
        <div>
          <span className="font-medium">Time:</span>{" "}
          {new Date(time).toLocaleString()}
        </div>
        <div>
          <span className="font-medium">Date:</span>{" "}
          {new Date(date).toLocaleString()}
        </div>
        <div className="pt-2 text-sm text-gray-500">Ride ID: {rideId}</div>
      </div>

      {/* Button */}
      <div className="mt-4 flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition">
          View Details
        </button>
      </div>
    </div>
  );
};

export default RideNotifyCard;
