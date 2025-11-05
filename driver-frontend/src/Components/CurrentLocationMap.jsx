import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";
import DriverStore from "../Store/DriverStore";
import api from "../api/axiosClient";

// 🔑 Decode JWT
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

// 🚗 Car icon
const carIcon = new L.Icon({
  iconUrl: "/car.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
};

const CurrentLocationMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const [driverEmail, setDriverEmail] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [timers, setTimers] = useState({});

  const token = DriverStore((state) => state.token);

  // 🧠 Decode driver email
  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.email) setDriverEmail(decoded.email);
    }
  }, [token]);

  // 🔌 Connect socket
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("🚗 Connected:", socketRef.current.id);
    });

    // 🚨 Ride request received
    socketRef.current.on("ride:alert", (msg) => {
      const rideId = msg.rideId;
      setRideRequests((prev) => [...prev, msg]);
      setTimers((prev) => ({ ...prev, [rideId]: 25 })); // 25s countdown

      // Auto-remove after 25s
      const timeout = setTimeout(() => {
        setRideRequests((prev) => prev.filter((r) => r.rideId !== rideId));
      }, 25000);

      return () => clearTimeout(timeout);
    });

    return () => socketRef.current.disconnect();
  }, []);

  // ⏳ Countdown logic
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

  // 📍 Track live location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation([coords.lat, coords.lng]);

        if (socketRef.current && socketRef.current.connected && driverEmail) {
          socketRef.current.emit("driver:location:update", {
            socketid: socketRef.current.id,
            email: driverEmail,
            coordinates: coords,
          });
        }
      },
      () => setError("Unable to get location"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [driverEmail]);

  // 🧭 Accept / Reject
  const handleAccept = (ride) => {
    api
      .post("acceptride", { rideId: ride.rideId, driverEmail })
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
    <div className="flex flex-col items-center gap-4">
      {/* 🌍 Map container */}
      <div className="w-[100%] h-[350px] rounded-2xl overflow-hidden shadow-lg border border-gray-300 bg-white md:w-[50%] md:ml-[560px] flex flex-col">
        <div className="flex-1 relative">
          {error && (
            <p className="text-red-500 text-center py-4 font-medium">{error}</p>
          )}
          {!location && !error && (
            <p className="text-gray-600 text-center py-4 font-medium">
              Fetching current location...
            </p>
          )}
          {location && (
            <MapContainer
              center={location}
              zoom={15}
              className="h-full w-full rounded-2xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />
              <Marker position={location} icon={carIcon}>
                <Popup>You are here 🚗</Popup>
              </Marker>
              <RecenterMap position={location} />
            </MapContainer>
          )}
        </div>
      </div>

      {/* 🧾 Requests section below map */}
      {rideRequests.length > 0 && (
        <div className="w-[100%] md:ml-[560px] md:w-[50%] bg-white border border-gray-300 rounded-2xl shadow-md p-4 mt-3">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3 sticky top-0 bg-white z-10">
            🚘 Incoming Ride Requests
          </h2>

          {/* Scrollable request list */}
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
                    <strong>Dropoff:</strong> {ride.dropoff}
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

                  {/* Circular countdown */}
                  <svg className="w-6 h-6 mt-1">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#ccc"
                      strokeWidth="2"
                      fill="transparent"
                    />
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
      )}
    </div>
  );
};

export default CurrentLocationMap;
