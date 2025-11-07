// 📁 components/RideRequests.jsx
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import moment from "moment";
import api from "../api/axiosClient";
import DriverStore from "../Store/DriverStore";

function RiderReqMessage ({socketRef}){
  const [rideRequests, setRideRequests] = useState([]);
  const [timers, setTimers] = useState({});
  // const socketRef = useRef(null);
  const token = DriverStore((state) => state.token);
  const [driverEmail, setDriverEmail] = useState(null);

  const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Error decoding JWT:", err);
    return null;
  }
};

useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.email) setDriverEmail(decoded.email);
    }
  }, [token]);


   useEffect(() => {
    // socketRef.current = io("http://localhost:8080", { transports: ["websocket"] });

    socketRef?.current?.on("connect", () => {
      console.log("🚗 Connected:", socketRef.current.id);
    });

    // 🚨 Ride request received
    socketRef?.current?.on("ride:alert", (msg) => {
      const rideId = msg.rideId;
      setRideRequests((prev) => [...prev, msg]);
      setTimers((prev) => ({ ...prev, [rideId]: 25 })); // 25s countdown

      // Auto-remove after 25s
      const timeout = setTimeout(() => {
        setRideRequests((prev) => prev.filter((r) => r.rideId !== rideId));
      }, 25000);

      return () => clearTimeout(timeout);
    });

    return () => socketRef?.current?.disconnect();
  }, []);

  // Countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 0) updated[id] -= 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = (ride) => {
    api
      .post("acceptride", { rideId: ride.rideId, driverEmail,date,time })
      .then(() => {
        alert("✅ You accepted the ride request!");
        setRideRequests((prev) => prev.filter((r) => r.rideId !== ride.rideId));
      })
      .catch((err) => console.error("Error:", err));
  };

  const handleReject = (ride) => {
    alert("❌ You rejected the ride request!");
    setRideRequests((prev) => prev.filter((r) => r.rideId !== ride.rideId));
  };

  return (
    <div className="w-full bottom-19  md:w-[50%] md:ml-[560px] bg-white border border-gray-300 rounded-2xl shadow-md p-4 mt-39">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
        🚘 Incoming Ride Requests
      </h2>
      <div className="max-h-[300px] overflow-y-auto pr-2">
        {rideRequests.map((ride) => (
          <div
            key={ride.rideId}
            className="border border-gray-200 rounded-xl p-3 mb-3 flex justify-between items-center hover:bg-gray-50 transition"
          >
            <div className="flex flex-col">
              <p className="font-semibold text-gray-900">
                Ride ID: <span className="text-blue-600">{ride.rideId}</span>
              </p>
              <p className="text-sm text-gray-700">
                <strong>Pickup:</strong> {ride.pickup} <br />
                <strong>Dropoff:</strong> {ride.dropoff} <br />
                <strong>Date:</strong> {moment(ride.date).format("MMMM Do YYYY")} <br />
                <strong>Time:</strong> {moment(ride.time, "HH:mm").format("h:mm A")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Auto-expiring in {timers[ride.rideId] || 0}s...
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleAccept(ride)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(ride)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg"
              >
                Reject
              </button>

              <svg className="w-6 h-6 mt-1">
                <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="2" fill="transparent" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#22c55e"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 10}
                  strokeDashoffset={
                    (1 - (timers[ride.rideId] || 0) / 25) * 2 * Math.PI * 10
                  }
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiderReqMessage;
