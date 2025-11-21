import React, { useEffect, useState } from "react";
import moment from "moment";
import api from "../api/axiosClient";
import DriverStore from "../Store/DriverStore";
import { useNavigate } from "react-router-dom";

const RiderReqMessage = ({ ride, socketRef }) => {
  if (!ride) return null; // Safety check

  const { pickup, dropoff, time, date, rideId } = ride;
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const navigate = useNavigate();
  const token = DriverStore((state) => state.token);
  let driverEmail = null;
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = JSON.parse(atob(base64));
      driverEmail = jsonPayload.email;
    } catch (err) {
      console.warn("Could not parse driver token", err);
    }
  }

  // Countdown progress bar (100 → 0 over 25 seconds)
  useEffect(() => {
    const totalTime = 25; // seconds
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed++;
      const newProgress = Math.max(100 - (elapsed / totalTime) * 100, 0);
      setProgress(newProgress);

      // When progress reaches 0 → hide the card
      if (elapsed >= totalTime) {
        setVisible(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAccept = () => {
    api
      .post("acceptride", { rideId, date, time, driverEmail })
      .then(() => {
        alert("✅ You accepted the ride request!");
        setVisible(false);

        // Join ride room as driver so driver can emit locations to that room
        try {
          if (socketRef?.current) {
            socketRef.current.emit("ride:join", { rideId, role: "driver", email: driverEmail });
          }
        } catch (err) {
          console.warn("Could not join ride room via socket:", err);
        }

        navigate("/ridinglocation", { state: { rideId } });
      })
      .catch((err) => console.error("Error:", err));
  };

  const handleReject = () => {
    alert("❌ You rejected the ride request!");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-[100%] md:w-[30%] md:absolute md:top-8 md:left-265 bg-white border border-gray-300 rounded-2xl shadow-md p-4 mt-10">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
        🚘 Incoming Ride Requests
      </h2>

      <div className="max-h-[300px] overflow-y-auto pr-2">
        <div
          key={rideId}
          className="relative border border-gray-200 rounded-xl p-3 mb-3 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              Ride ID: <span className="text-blue-600">{rideId}</span>
            </p>
            <p className="text-sm text-gray-700">
              <strong>Pickup:</strong> {pickup} <br />
              <strong>Dropoff:</strong> {dropoff} <br />
              <strong>Date:</strong> {moment(date).format("MMMM Do YYYY")} <br />
              <strong>Time:</strong> {moment(time, "HH:mm").format("h:mm A")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAccept}
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-lg"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg"
            >
              Reject
            </button>
          </div>

          {/* Bottom progress bar */}
          <div className="absolute bottom-0 left-0 h-[4px] bg-gray-200 w-full rounded-b-xl overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderReqMessage;
