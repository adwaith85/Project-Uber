import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Confetti from "react-confetti";
// removed leaflet-routing-machine to avoid its UI and markers
import NavbarX from "../Components/NavbarX";
import { useNavigate } from "react-router-dom";

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

// We'll fetch a route geometry (GeoJSON) from OSRM and draw it as a Polyline

const Destination = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [showFeedback, setShowFeedback] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");


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

        // Prefer coordinates stored as GeoJSON Point in the trip data
        if (trip.dropoffLocation && trip.dropoffLocation.coordinates && trip.dropoffLocation.coordinates.length === 2) {
          const [lng, lat] = trip.dropoffLocation.coordinates; // GeoJSON: [lng, lat]
          setDropoffLocation({ lat: Number(lat), lng: Number(lng) });
          return;
        }

        // Backwards-compat: if older fields exist use them
        if (trip.dropoffLat && trip.dropoffLng) {
          setDropoffLocation({ lat: Number(trip.dropoffLat), lng: Number(trip.dropoffLng) });
          return;
        }

        // Last resort: fallback to geocoding the dropoff address (may fail for special characters)
        if (trip.dropoff) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trip.dropoff)}`
            );
            const geoData = await geoRes.json();

            if (geoData.length > 0) {
              setDropoffLocation({ lat: Number(geoData[0].lat), lng: Number(geoData[0].lon) });
            } else {
              console.warn("Geocoding returned no results for dropoff", trip.dropoff);
            }
          } catch (e) {
            console.warn("Geocoding request failed", e);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchDropoff();
  }, []);

  const center = currentLocation || { lat: 11.9635, lng: 75.3208 };

  // fetch route from OSRM demo server (or replace serviceUrl with your own)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!currentLocation || !dropoffLocation) return;
      try {
        const start = `${currentLocation.lng},${currentLocation.lat}`;
        const end = `${dropoffLocation.lng},${dropoffLocation.lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.routes?.length) {
          const route = data.routes[0];
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(coords);
          setDistance((route.distance / 1000).toFixed(2)); // km
          setEta(Math.ceil(route.duration / 60)); // min

          // fit map to route
          if (mapRef.current) {
            try {
              const bounds = L.latLngBounds(coords.map(([lat, lng]) => L.latLng(lat, lng)));
              mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            } catch (e) {
              console.warn("Could not fit route bounds", e);
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching route from OSRM", err);
      }
    };

    fetchRoute();
  }, [currentLocation, dropoffLocation]);

  return (
    <>
      <NavbarX />
      {/* {Number(distance) && <Confetti recycle={false} numberOfPieces={300} />} */}
      <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
        <MapContainer
          center={[center.lat || center[0], center.lng || center[1]]}
          zoom={13}
          scrollWheelZoom
          className="h-[400px] w-full z-0"
          whenCreated={(map) => (mapRef.current = map)}
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
          {routeCoords && routeCoords.length > 0 && (
            <Polyline positions={routeCoords} pathOptions={{ color: "blue", weight: 5 }} />
          )}
        </MapContainer>
      </div>
      {distance && eta && (

        <div className="absolute top-20 left-2 bg-orange-400 text-white px-4 py-5 rounded shadow-lg text-sm font-bold z-0">
          <div>� Heading to Pickup</div>
          <div className="text-xs mt-1">📍 {distance} km away | ⏱ {eta} min</div>
        </div>
      )}
      {
        distance && Number(distance) <= 0.5 && showFeedback && (
          <>
            {/* BACKGROUND BLUR */}
            <div className="fixed inset-0 bg-black/40 backdrop-brightness-50  z-[100]" />
            <Confetti recycle={false} numberOfPieces={2000} className="w-full h-full" />
            <div className="
        fixed top-70 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[90%] md:w-[400px] p-6 rounded-2xl shadow-2xl flex flex-col items-center z-[300] ">
              {/* CLOSE BUTTON */}
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
                onClick={() => {
                  setShowFeedback(false)
                  navigate('/UserHome')
                }}
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mt-2 mb-4">
                Arrived at Your Destination
              </h2>
              {/* STAR RATING */}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl cursor-pointer transition ${rating >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* FEEDBACK BOX */}
              <textarea
                className="w-full h-24 border border-gray-300 rounded-lg p-2 text-sm
                     focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Write your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              {/* BUTTONS */}
              <div className="flex gap-3 w-full mt-4">
                <button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl"
                  onClick={() => {
                    console.log("Rating:", rating);
                    console.log("Feedback:", feedback);
                    setShowFeedback(false);
                    navigate('/UserHome');
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )
      }

    </>
  );
};

export default Destination;
