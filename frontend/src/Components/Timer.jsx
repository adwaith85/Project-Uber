import React, { useState, useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const TimerCountDown = ({ orderId, setCounter }) => {
  console.log("🚀 TimerCountDown orderId:", orderId);
  const INITIAL_DURATION = 20;
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_DURATION);
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

  const navigate = useNavigate();
  const socketRef = useRef(null);

  // ---- Initialize socket ----
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socketRef.current.emit("checkOrderStatus", { orderId });
    // Join ride room so we can receive immediate room events
    socketRef.current.emit("ride:join", { rideId: orderId, role: "user" });

    socketRef.current.on("orderStatus", (data) => {
      if (data.status === "accepted") {
        setOrderAccepted(true);
        setIsRunning(false);
      }
    });

    socketRef.current.on("ride:accepted", (data) => {
      if (data?.rideId && String(data.rideId) === String(orderId)) {
        setOrderAccepted(true);
        setIsRunning(false);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [orderId]);

  // ---- Timer countdown ----
  useEffect(() => {
    if (!isRunning || orderAccepted || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, orderAccepted]);

  // ---- Navigate when accepted ----
  useEffect(() => {
    if (orderAccepted) {
      const timeout = setTimeout(() => navigate(`/ridinglocation?rideId=${orderId}`), 3000);
      return () => clearTimeout(timeout);
    }
  }, [orderAccepted, navigate, orderId]);

  // ---- Format time ----
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [timeRemaining]);

  // Calculate progress percentage
  const progress = ((INITIAL_DURATION - timeRemaining) / INITIAL_DURATION) * 100;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* 🎉 Confetti */}
      {orderAccepted && <Confetti recycle={false} numberOfPieces={300} />}

      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Ride Request Status</h1>
            </div>
            <p className="text-gray-300 text-sm md:text-base">
              Waiting for driver confirmation...
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-12">
            <div className="flex flex-col items-center space-y-8">
              {/* Circular Timer */}
              <div className="relative">
                {/* Progress Ring */}
                <svg className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke={
                      orderAccepted
                        ? "#10b981"
                        : timeRemaining <= 5
                          ? "#f59e0b"
                          : "#3b82f6"
                    }
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-5xl md:text-6xl font-bold font-mono ${orderAccepted
                          ? "text-green-600"
                          : timeRemaining <= 5
                            ? "text-amber-500 animate-pulse"
                            : "text-blue-600"
                        }`}
                    >
                      {formattedTime}
                    </div>
                    <div className="text-sm md:text-base text-gray-500 mt-2">
                      {orderAccepted ? "Accepted!" : "remaining"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="w-full">
                {orderAccepted ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      Ride Accepted!
                    </h3>
                    <p className="text-green-700">
                      Redirecting to driver location...
                    </p>
                  </div>
                ) : timeRemaining === 0 ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-800 mb-4">
                      Time's Up!
                    </h3>
                    <p className="text-red-700 mb-6">
                      No driver accepted your request. Please try booking again.
                    </p>
                    <button
                      onClick={() => setCounter({ showCounter: false, orderId: null })}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Retry Booking
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping delay-75"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping delay-150"></div>
                    </div>
                    <p className="text-blue-800 font-medium mt-4">
                      Searching for driver acceptance...
                    </p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              {!orderAccepted && timeRemaining > 0 && (
                <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Tip:</strong> Drivers nearby will receive your request.
                    The first to accept will be assigned to your ride.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerCountDown;