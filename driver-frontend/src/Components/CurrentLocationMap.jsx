import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";
import DriverStore from "../Store/DriverStore"; // adjust path if needed
import api from "../api/axiosClient";

// 🔑 Simple JWT decoder (client-side)
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

// 🚗 Custom car icon
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

  // 🧠 Access token from Zustand store
  const token = DriverStore((state) => state.token);

  // Decode token to get driver email
  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.email) {
        setDriverEmail(decoded.email);
        console.log("👨‍✈️ Driver email:", decoded.email);
      } else {
        console.warn("No email found in token");
      }
    } else {
      console.warn("No driver token found in store");
    }
  }, [token]);

  // 🔌 Connect to socket server
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("🚗 Client connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Client disconnected:", socketRef.current.id);
    });

     socketRef.current.on("ride:alert", (msg) => {
      
    let ans= prompt(`New Ride Request!\nPickup: ${msg.pickup}\nDropoff: ${msg.dropoff}\n id:${msg.rideId}`)
    
      if(ans!=null){
        api.post('/acceptride',{
          rideId:msg.rideId,
          driverEmail:driverEmail
        }).then((response)=>{
          alert("You accepted the ride request!")
        }).catch((error)=>{
          console.error("Error accepting ride:", error)
        })
      }else{
        alert("You rejected the ride request!")
      }
  });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 📍 Watch and send live location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation([coords.lat, coords.lng]);

        // ✅ Emit driver email + location to socket
        if (socketRef.current && socketRef.current.connected && driverEmail) {
          socketRef.current.emit("driver:location:update", {
            email: driverEmail,
            coordinates: coords,
          });
        }
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location");
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [driverEmail]);

  return (
    <div className="fixed w-[90%] h-[350px] rounded-2xl overflow-hidden shadow-lg border border-gray-300 bg-white md:w-[50%] md:right-8">
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
          className="h-full w-[100%] rounded-2xl"
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
  );
};

export default CurrentLocationMap;
