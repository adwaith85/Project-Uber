import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import UserStore from "../Store/UserStore";
import "leaflet/dist/leaflet.css";
import NavbarX from "./NavbarX";

const driverIcon = new L.Icon({
  iconUrl: "/carimg.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const userIcon = new L.Icon({
  iconUrl: "/start.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const UserRideMap = () => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const socketRef = useRef(null);
  const location = useLocation();
  const [rideId, setRideId] = useState(null);
  const token = UserStore((state) => state.token);
  const [userEmail, setUserEmail] = useState(null);
  const [otpReceived, setOtpReceived] = useState(null);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const navigate=useNavigate()

  // Connect socket
  useEffect(() => {
    console.log("🔌 Creating socket connection to http://localhost:8080");
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected to server:", socketRef.current.id);
      // Now that socket is connected, try to join room if rideId is available
      if (rideId && userEmail) {
        console.log("📌 [CONNECT] Attempting to join room immediately with rideId:", rideId);
        socketRef.current.emit("ride:join", { rideId, role: "user", email: userEmail });
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected from server");
    });

    socketRef.current.on("ride:joined", (data) => {
      console.log("✅ Server confirmed ride:join - joined room:", data.room);
    });

    socketRef.current.on("driver:location", (coords) => {
      console.log("🚗 Driver location received from server:", coords);
      if (coords?.lat && coords?.lng) {
        setDriverLocation(coords);
        console.log("✅ Driver location state updated:", coords);
      } else {
        console.warn("⚠️ Invalid driver location data:", coords);
      }
    });

    socketRef.current.on("ride:accepted", (data) => {
      // when backend tells the room the ride is accepted, we can ensure rideId is set
      console.log("✅ Ride accepted event received:", data);
      if (data?.rideId) setRideId(String(data.rideId));
    });

    // When driver arrives, backend sends OTP to room
    socketRef.current.on("driver:arrived", (data) => {
      console.log("🔔 Driver arrived event:", data);
      if (data?.rideId && String(data.rideId) === String(rideId)) {
          setOtpReceived(data.otp);
          // Let user know OTP was generated and is shown below
          alert("Driver has arrived. Please note the OTP shown below and give it to the driver.");
      }
    });

    socketRef.current.on("otp:confirmed", (data) => {
      console.log("✅ OTP confirmed event:", data);
      if (data?.rideId && String(data.rideId) === String(rideId)) {
        if (data.success) {
          setJourneyStarted(true);
          alert("✅ OTP confirmed. Journey started!");
          // navigate with a full reload so destination page state is fresh
          // include rideId so Destination page can fetch the correct trip
          if (rideId) {
            window.location.href = `/destination?rideId=${rideId}`;
          } else {
            window.location.href = "/destination";
          }
        } else {
          alert("❌ OTP incorrect. Please try again.");
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("🔌 Socket connection cleanup");
      }
    };
  }, [rideId, userEmail]);

  // Join room whenever rideId changes (from query string or ride:accepted event)
  useEffect(() => {
    if (!socketRef.current) {
      console.log("⏳ Socket not ready yet");
      return;
    }

    if (!rideId) {
      console.log("⏳ rideId not set yet");
      return;
    }

    if (socketRef.current.connected) {
      console.log("📌 [EFFECT] Joining room with rideId:", rideId, "and email:", userEmail);
      socketRef.current.emit("ride:join", { rideId, role: "user", email: userEmail });
    } else {
      console.log("⏳ Socket connecting... will join room on connect");
    }
  }, [rideId, userEmail]);

  // User no longer confirms OTP — driver will confirm it. Keep socket listener for otp:confirmed.

  // Send user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("❌ Geolocation not supported");
      return;
    }

    if (!rideId) {
      console.log("⏳ Not tracking location yet - rideId not set");
      return;
    }

    console.log("📍 Starting geolocation watch for user");
    let updateCount = 0;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        
        // Only emit location if socket is connected and rideId is available
        if (socketRef.current?.connected && rideId) {
          socketRef.current.emit("user:location:update:onride", {
            coordinates: coords,
            rideId,
            email: userEmail,
          });
          updateCount++;
          console.log(`📍 User location sent to server #${updateCount}:`, coords, "rideId:", rideId, "email:", userEmail);
        } else {
          console.warn("⚠️ Cannot send location - socket/rideId not ready:", {
            socketConnected: socketRef.current?.connected,
            rideId,
            email: userEmail,
          });
        }
      },
      (err) => {
        console.error("❌ User geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      console.log(`🛑 Stopped user geolocation watch (sent ${updateCount} updates)`);
      navigator.geolocation.clearWatch(watcher);
    };
  }, [rideId, userEmail]);

  // Fetch route and compute distance/ETA
  const fetchRoute = async (start, end) => {
    try {
      console.log("🌐 Fetching route from OSRM...", { start, end });
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.length) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        console.log("✅ Route fetched successfully", {
          distance: route.distance,
          duration: route.duration,
          coordsCount: coords.length
        });
        setRouteCoords(coords);
        setDistance((route.distance / 1000).toFixed(2)); // km
        setEta(Math.ceil(route.duration / 60)); // minutes
        console.log("📌 State updated with route coords, distance, and ETA");
      } else {
        console.warn("⚠️ No routes returned from OSRM", data);
      }
    } catch (err) {
      console.error("❌ Route fetch error:", err);
    }
  };

  useEffect(() => {
    if (driverLocation && userLocation) {
      console.log("🗺️ Both locations available, fetching route...");
      fetchRoute(driverLocation, userLocation);
    } else {
      console.log("⏳ Waiting for both locations...", { driverLocation, userLocation });
    }
  }, [driverLocation, userLocation]);

  useEffect(() => {
    // read rideId from query string
    const params = new URLSearchParams(location.search);
    const q = params.get("rideId");
    if (q) setRideId(q);
  }, [location]);

  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = JSON.parse(atob(base64));
        setUserEmail(jsonPayload.email);
      } catch (err) {
        console.warn("Could not parse token for email", err);
      }
    }
  }, [token]);

  const center = userLocation || driverLocation || { lat: 11.9635, lng: 75.3208 };

  return (<>
    <div className="">
      <NavbarX/>
    </div>
    <div className="m-4 rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%] md:mx-auto relative">
      {journeyStarted && distance && eta && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded shadow-lg text-sm font-bold z-10">
          <div>🚗 En Route to Destination</div>
          <div className="text-xs mt-1">📍 {distance} km away | ⏱ {eta} min</div>
        </div>
      )}

      {distance && eta && !journeyStarted && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-4 py-3 rounded shadow-lg text-sm font-bold z-10">
          <div>� Driver Arriving</div>
          <div className="text-xs mt-1">📍 {distance} km away | ⏱ {eta} min</div>
        </div>
      )}

      <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-[400px] w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {driverLocation && (
          <>
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>Driver 🚗</Popup>
            </Marker>
            <CircleMarker
              center={[driverLocation.lat, driverLocation.lng]}
              radius={5}
              color="blue"
              fill={true}
              fillColor="blue"
              fillOpacity={0.5}
            />
          </>
        )}

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You 📍</Popup>
            </Marker>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={6}
              color="red"
              fill={true}
              fillColor="red"
              fillOpacity={0.5}
            />
          </>
        )}

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="blue" weight={4} opacity={0.7} />
        )}
      </MapContainer>

      {/* Status info box */}
      <div className="absolute bottom-2 left-2 right-2 bg-gray-800 text-white p-3 rounded text-xs z-10">
        <div className="flex justify-between gap-4">
          <div>
            <span>🚗 Driver: </span>
            {driverLocation ? (
              <span className="text-green-400">✓ Connected</span>
            ) : (
              <span className="text-red-400">✗ Waiting...</span>
            )}
          </div>
          <div>
            <span>👤 You: </span>
            {userLocation ? (
              <span className="text-green-400">✓ Connected</span>
            ) : (
              <span className="text-red-400">✗ Waiting...</span>
            )}
          </div>
          <div>
            <span>🗺️ Route: </span>
            {routeCoords.length > 0 ? (
              <span className="text-green-400">✓ Active</span>
            ) : (
              <span className="text-yellow-400">⏳ Loading...</span>
            )}
          </div>
        </div>
      </div>

      {/* OTP display for rider (read-only) */}
      {otpReceived && !journeyStarted && (
        <div className="absolute top-20 left-4 bg-white p-4 rounded shadow z-20 w-[90%] md:w-[40%]">
          <h3 className="font-semibold mb-2">Driver arrived — OTP</h3>
          <p className="text-sm mb-2">Provide the OTP below to the driver so they can confirm pickup.</p>
          <div className="p-3 bg-gray-100 rounded text-center font-mono text-lg">{otpReceived}</div>
        </div>
      )}
    </div>
    </>
  );
};

export default UserRideMap;
