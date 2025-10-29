import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const carIcon = new L.Icon({
  iconUrl: "/carimg.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const userIcon = new L.Icon({
  iconUrl: "/person1.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

function FitBounds({ route, pickupLocation, dropoffLocation, currentLocation }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current) return; 

    const validPoints = [
      ...(route?.filter(p => p?.lat && p?.lng).map(p => [p.lat, p.lng]) || []),
      pickupLocation?.lat && pickupLocation?.lng ? [pickupLocation.lat, pickupLocation.lng] : null,
      dropoffLocation?.lat && dropoffLocation?.lng ? [dropoffLocation.lat, dropoffLocation.lng] : null,
      currentLocation?.lat && currentLocation?.lng ? [currentLocation.lat, currentLocation.lng] : null,
    ].filter(Boolean);

    if (validPoints.length >= 2) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (validPoints.length === 1) {
      map.flyTo(validPoints[0], 14, { animate: true });
    }

    hasFitted.current = true;
  }, [route, pickupLocation, dropoffLocation, currentLocation, map]);

  return null;
}

function FollowDriver({ driverLocation }) {
  const map = useMap();
  const prevLocation = useRef(null);

  useEffect(() => {
    if (!driverLocation) return;

    const prev = prevLocation.current;
    if (
      !prev ||
      Math.abs(driverLocation.lat - prev.lat) > 0.0003 ||
      Math.abs(driverLocation.lng - prev.lng) > 0.0003
    ) {
      map.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
      prevLocation.current = driverLocation;
    }
  }, [driverLocation, map]);

  return null;
}

const CurrentLocationMap = ({ currentLocation, pickupLocation, dropoffLocation, route }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to Socket.IO:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO");
    });

    socketRef.current.on("driver:location", (location) => {
      if (location?.lat && location?.lng) {
        setDriverLocation(location);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const center =
    driverLocation
      ? [driverLocation.lat, driverLocation.lng]
      : currentLocation
        ? [currentLocation.lat, currentLocation.lng]
        : pickupLocation
          ? [pickupLocation.lat, pickupLocation.lng]
          : dropoffLocation
            ? [dropoffLocation.lat, dropoffLocation.lng]
            : [20.5937, 78.9629]; 

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
      {center ? (
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-[400px] w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>Your Location 🚶</Popup>
            </Marker>
          )}

          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
              <Popup>Driver 🚗</Popup>
            </Marker>
          )}

          {pickupLocation && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={userIcon}>
              <Popup>Pickup 📍</Popup>
            </Marker>
          )}

          {dropoffLocation && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]}>
              <Popup>Dropoff 🎯</Popup>
            </Marker>
          )}

          {route && route.length > 0 && (
            <Polyline
              positions={route.map((p) => [p.lat, p.lng])}
              color="blue"
              weight={4}
              opacity={0.7}
            />
          )}

          <FitBounds
            route={route}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            currentLocation={currentLocation}
          />
          <FollowDriver driverLocation={driverLocation} />
        </MapContainer>
      ) : (
        <p className="text-center py-10 text-gray-500">Fetching current location...</p>
      )}
    </div>
  );
};

export default CurrentLocationMap;
