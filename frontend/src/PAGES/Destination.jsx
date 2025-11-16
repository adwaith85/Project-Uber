import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import NavbarX from "../Components/NavbarX";

const userIcon = new L.Icon({
  iconUrl: "/carimg.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const destinationIcon = new L.Icon({
  iconUrl: "/drop.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Component to draw route
const Routing = ({ userLocation, dropoff }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!userLocation || !dropoff) return;

    // If control already exists, update waypoints
    if (routingRef.current) {
      try {
        routingRef.current.setWaypoints([
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(dropoff.lat, dropoff.lng),
        ]);
      } catch (e) {
        console.warn("Could not update routing waypoints", e);
      }
      return;
    }

    // Create routing control once
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(dropoff.lat, dropoff.lng),
      ],
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
      // addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      // Don't show the textual navigation/instructions panel — only render the route line
      show: false,
      // createMarker must be a function; return null to skip default markers
      createMarker: () => null,
    }).addTo(map);

    routingRef.current = control;

    // Fit map to the two waypoints so both are visible
    try {
      const bounds = L.latLngBounds([
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(dropoff.lat, dropoff.lng),
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn("Could not fit bounds", e);
    }

    return () => {
      try {
        if (routingRef.current) map.removeControl(routingRef.current);
      } catch (e) {
        console.warn("Error removing routing control", e);
      }
      routingRef.current = null;
    };
  }, [userLocation, dropoff, map]);

  return null;
};

const Destination = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  // 1️⃣ Get user GPS
  useEffect(() => {
    if (!navigator.geolocation) return;

    let watcher = null;
    try {
      watcher = navigator.geolocation.watchPosition(
        (pos) =>
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.log(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } catch (e) {
      console.warn("Geolocation watch failed", e);
    }

    return () => {
      if (watcher && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, []);

  // 2️⃣ Fetch dropoff location from MongoDB
  useEffect(() => {
    const fetchDropoff = async () => {
      try {
        // read rideId from query params
        const params = new URLSearchParams(window.location.search);
        const rideId = params.get("rideId");
        if (!rideId) {
          console.warn("No rideId in query params");
          return;
        }

        const res = await fetch(`http://localhost:8080/trip/${rideId}`);
        if (!res.ok) {
          console.error("Failed to fetch trip", res.statusText);
          return;
        }
        const trip = await res.json();

        // If backend stored dropoff coordinates, use them directly
        if (trip.dropoffLat && trip.dropoffLng) {
          setDropoffLocation({ lat: Number(trip.dropoffLat), lng: Number(trip.dropoffLng) });
          return;
        }

        // Otherwise, fallback to geocoding the dropoff address
        if (trip.dropoff) {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.dropoff)}`
          );
          const geoData = await geoRes.json();

          if (geoData.length > 0) {
            setDropoffLocation({ lat: Number(geoData[0].lat), lng: Number(geoData[0].lon) });
          } else {
            console.warn("Geocoding returned no results for dropoff", trip.dropoff);
          }
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
