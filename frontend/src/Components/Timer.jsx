import React, { useState, useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";

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

    socketRef.current.on("orderStatus", (data) => {
      if (data.status === "accepted") {
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
      const timeout = setTimeout(() => navigate("/home"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [orderAccepted, navigate]);

  // ---- Format time ----
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [timeRemaining]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 font-sans relative overflow-hidden">
      {/* 🎉 Confetti */}
      {orderAccepted && <Confetti recycle={false} numberOfPieces={300} />}

      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Order Countdown
        </h1>

        {/* Round Counter */}
        <div
          className={`relative flex items-center justify-center w-48 h-48 rounded-full border-[10px] ${orderAccepted
              ? "border-green-500 text-green-600"
              : timeRemaining <= 5
                ? "border-amber-400 text-amber-500 animate-pulse"
                : "border-blue-400 text-blue-600"
            } font-mono text-5xl font-bold`}
        >
          {formattedTime}
        </div>

        {/* Status Text */}
        <p className="text-center text-lg font-medium">
          {orderAccepted ? (
            <span className="text-green-600 font-bold">
              ✅ Order Accepted!
            </span>
          ) : timeRemaining === 0 ? (
            <div className="flex flex-col items-center justify-center mt-8 space-y-4">
              <span className="text-2xl font-extrabold text-red-600 flex items-center gap-2">
                ⏰ Time’s Up!
              </span>

              <button
                onClick={() => setCounter({ showCounter: false, orderId: null })}
                className="px-6 py-2 text-white font-semibold bg-gradient-to-r from-red-500 to-orange-400 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                🔁 Retry Booking
              </button>
            </div>
          ) : (
            <span className="text-blue-600">Waiting for acceptance...</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default TimerCountDown;