// 📁 components/MapView.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";
import DriverStore from "../Store/DriverStore";

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

const CurrentLocationMap = ({ socketRef }) => {

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const token = DriverStore((state) => state.token);
  const [driverEmail, setDriverEmail] = useState(null);

  // Decode JWT manually
  useEffect(() => {
    if (token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = JSON.parse(atob(base64));
      setDriverEmail(jsonPayload.email);
    }
  }, [token]);

  // Connect socket
  useEffect(() => {
    socketRef?.current?.on("connect", () => {
      console.log("✅ Connected to socket:", socketRef.current.id);
    });

    return () => socketRef?.current?.disconnect();
  }, []);

  // Track driver location
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

  return (
    <div className="w-full h-[350px] md:w-[100%] md:ml-[0px] rounded-2xl overflow-hidden shadow-lg border border-gray-300 bg-white">
      {error && <p className="text-red-500 text-center py-4 font-medium">{error}</p>}
      {!location && !error && (
        <p className="text-gray-600 text-center py-4 font-medium">Fetching location...</p>
      )}
      {location && (
        <MapContainer center={location} zoom={15} className="z-0 h-full w-full ">
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