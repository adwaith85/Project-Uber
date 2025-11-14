import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import NavbarX from "../Components/NavbarX";

const userIcon = new L.Icon({
  iconUrl: "/user.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const destinationIcon = new L.Icon({
  iconUrl: "/destination.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Component to draw route
const Routing = ({ userLocation, dropoff }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!userLocation || !dropoff) return;

    // Remove previous route
    if (routingRef.current) map.removeControl(routingRef.current);

    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(dropoff.lat, dropoff.lng),
      ],
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: true,
    }).addTo(map);

    routingRef.current = control;

    return () => map.removeControl(control);
  }, [userLocation, dropoff]);

  return null;
};

const Destination = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  // 1️⃣ Get user GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );
  }, []);

  // 2️⃣ Fetch dropoff location from MongoDB
  useEffect(() => {
    const fetchDropoff = async () => {
      try {
        const res = await fetch("http://localhost:8080/trip/690ad1001965e237c9108a30"); // Replace with actual tripId
        const trip = await res.json();

        // Convert address → lat/lng using Nominatim
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${trip.dropoff}`
        );
        const geoData = await geoRes.json();

        if (geoData.length > 0) {
          setDropoffLocation({
            lat: Number(geoData[0].lat),
            lng: Number(geoData[0].lon),
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchDropoff();
  }, []);

  const center = currentLocation || [11.9635, 75.3208];

  return (
    <>
      <NavbarX />
      <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          className="h-[400px] w-full z-0"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={userIcon}
            />
          )}

          {dropoffLocation && (
            <Marker
              position={[dropoffLocation.lat, dropoffLocation.lng]}
              icon={destinationIcon}
            />
          )}

          {currentLocation && dropoffLocation && (
            <Routing userLocation={currentLocation} dropoff={dropoffLocation} />
          )}
        </MapContainer>
      </div>
    </>
  );
};

export default Destination;
