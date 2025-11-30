import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import UserStore from "../Store/UserStore";
import "leaflet/dist/leaflet.css";
import NavbarX from "./NavbarX";
import { Navigation, Clock, MapPin, Key, CheckCircle } from "lucide-react";
import Footer from "./Footer";

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
  const [driverArrived, setDriverArrived] = useState(false);
  const navigate = useNavigate();
  const otpSectionRef = useRef(null);

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
      console.log("✅ Ride accepted event received:", data);
      if (data?.rideId) setRideId(String(data.rideId));
    });

    socketRef.current.on("driver:arrived", (data) => {
      console.log("🔔 Driver arrived event:", data);
      if (data?.rideId && String(data.rideId) === String(rideId)) {
        setDriverArrived(true);
        setOtpReceived(data.otp);
        setDistance("0.0");
        setEta(0);
        alert("Driver has arrived. Please note the OTP shown below and give it to the driver.");

        // Scroll to OTP section after a short delay
        setTimeout(() => {
          otpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    });

    socketRef.current.on("otp:confirmed", (data) => {
      console.log("✅ OTP confirmed event:", data);
      if (data?.rideId && String(data.rideId) === String(rideId)) {
        if (data.success) {
          setJourneyStarted(true);
          alert("✅ OTP confirmed. Journey started!");
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

  // Join room whenever rideId changes
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
        setDistance((route.distance / 1000).toFixed(2));
        setEta(Math.ceil(route.duration / 60));
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

  return (
    <>
      <NavbarX />

      <div className="min-h-screen bg-gray-50 pt-[70px]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Driver Status */}
            <div className={`rounded-xl p-4 ${driverLocation ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-100 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${driverLocation ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Driver</p>
                  <p className={`font-bold ${driverLocation ? 'text-green-700' : 'text-gray-500'}`}>
                    {driverLocation ? '✓ Connected' : '⏳ Waiting...'}
                  </p>
                </div>
              </div>
            </div>

            {/* User Status */}
            <div className={`rounded-xl p-4 ${userLocation ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-100 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userLocation ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Your Location</p>
                  <p className={`font-bold ${userLocation ? 'text-blue-700' : 'text-gray-500'}`}>
                    {userLocation ? '✓ Tracking' : '⏳ Waiting...'}
                  </p>
                </div>
              </div>
            </div>

            {/* ETA */}
            <div className={`rounded-xl p-4 ${driverArrived
              ? 'bg-green-50 border-2 border-green-200'
              : distance && eta
                ? 'bg-amber-50 border-2 border-amber-200'
                : 'bg-gray-100 border-2 border-gray-200'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${driverArrived
                  ? 'bg-green-500'
                  : distance && eta
                    ? 'bg-amber-500'
                    : 'bg-gray-400'
                  }`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Arrival Time</p>
                  <p className={`font-bold ${driverArrived
                    ? 'text-green-700'
                    : distance && eta
                      ? 'text-amber-700'
                      : 'text-gray-500'
                    }`}>
                    {driverArrived
                      ? 'Arrived!'
                      : distance && eta
                        ? `${eta} min`
                        : 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Journey Status Banner */}
            {journeyStarted && distance && eta && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-lg">En Route to Destination</p>
                      <p className="text-sm text-green-100">Journey in progress</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{distance} km</p>
                    <p className="text-sm text-green-100">{eta} min away</p>
                  </div>
                </div>
              </div>
            )}

            {distance && eta && !journeyStarted && (
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-lg">Driver Arriving</p>
                      <p className="text-sm">Please wait at your pickup location</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{distance} km</p>
                    <p className="text-sm">{eta} min away</p>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="relative">
              <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-[500px] w-full z-0">
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
            </div>
          </div>

          {/* OTP Card */}
          {otpReceived && !journeyStarted && (
            <div ref={otpSectionRef} className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto">
              <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
                <div className="flex items-center gap-3">
                  <Key className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">Driver Arrived</h3>
                    <p className="text-gray-300 text-sm">Share this OTP with your driver</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-center text-sm text-gray-600 mb-3 font-medium">Your OTP Code</p>
                  <div className="text-center">
                    <span className="text-5xl font-bold font-mono text-blue-600 tracking-wider">
                      {otpReceived}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-4">
                  The driver will enter this code to start your journey
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default UserRideMap;
