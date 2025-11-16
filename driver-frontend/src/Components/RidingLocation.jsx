import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation, useNavigate } from "react-router-dom";
import DriverStore from "../Store/DriverStore";
import { useSocket } from "../context/SocketContext";
import Navbar from "./Navbar";

const carIcon = new L.Icon({
  iconUrl: "/car.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const userIcon = new L.Icon({
  iconUrl: "/userimg.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const RidingLocation = ({ socketRef: _socketRef, rideId: propRideId }) => {
  const globalSocketRef = useSocket(); // Get the persistent socket from context
  const socketRef = _socketRef || globalSocketRef; // Use prop if provided, otherwise use global
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [error, setError] = useState(null);

  const token = DriverStore((state) => state.token);
  const [driverEmail, setDriverEmail] = useState(null);
  const [rideId, setRideId] = useState(propRideId || null);
  const [arrivedSent, setArrivedSent] = useState(false);
  const [arrivalNotified, setArrivalNotified] = useState(false);
  const [arrivalReady, setArrivalReady] = useState(false); // within threshold, but not generated
  const [arrivalAlerted, setArrivalAlerted] = useState(false);
  const [otpSentToUser, setOtpSentToUser] = useState(false);
  const [otpInputDriver, setOtpInputDriver] = useState("");
  const [journeyStarted, setJourneyStarted] = useState(false);
  const location = useLocation();

  const navigate=useNavigate()

  useEffect(() => {
    if (!rideId && location?.state?.rideId) setRideId(location.state.rideId);
  }, [location, rideId]);

  useEffect(() => {
    if (token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = JSON.parse(atob(base64));
      setDriverEmail(jsonPayload.email);
    }
  }, [token]);

  // initialize socket if not provided
  useEffect(() => {
    if (_socketRef && _socketRef.current) {
      // socketRef already set above to use _socketRef or globalSocketRef
    }
  }, [_socketRef]);

  // Retry logic: wait for socket to connect, then join room
  useEffect(() => {
    if (!socketRef?.current || !rideId) {
      console.log("⏳ Waiting for socket ready and rideId...", { socketReady: socketRef?.current?.connected, rideId });
      return;
    }

    let isMounted = true;

    const attemptJoin = () => {
      if (!isMounted) return;
      if (socketRef.current?.connected) {
        console.log("✅ Socket connected. Joining ride room:", rideId);
        socketRef.current.emit("ride:join", { rideId, role: "driver", email: driverEmail });
      } else {
        console.log("⏳ Socket not connected yet. Retrying in 500ms...");
        setTimeout(attemptJoin, 500);
      }
    };

    attemptJoin();
    return () => {
      isMounted = false;
    };
  }, [rideId, driverEmail, socketRef]);

  // Socket listeners
  useEffect(() => {
    if (!socketRef?.current) return;

    // Join room on connect
    const onConnect = () => {
      console.log("✅ Socket connected event:", socketRef.current.id);
      if (rideId) {
        socketRef.current.emit("ride:join", { rideId, role: "driver", email: driverEmail });
        console.log("Sent ride:join from connect handler");
      }
    };

    socketRef.current.on("connect", onConnect);

    // Backend emits 'user:location' and 'driver:location' to the room
    socketRef.current.on("user:location", (coords) => {
      console.log("✅ driver received user:location", coords);
      if (coords?.lat && coords?.lng) {
        setUserLocation(coords);
        console.log("📍 User location updated on driver map:", coords);
      } else {
        console.warn("⚠️ Invalid user location data:", coords);
      }
    });

    socketRef.current.on("driver:location", (coords) => {
      console.log("✅ driver received driver:location", coords);
      if (coords?.lat && coords?.lng) {
        setDriverLocation(coords);
        console.log("📍 Driver location updated:", coords);
      } else {
        console.warn("⚠️ Invalid driver location data:", coords);
      }
    });

    // When driver accepted, backend will emit ride:accepted to the room
    socketRef.current.on("ride:accepted", (data) => {
      console.log("✅ ride:accepted event received", data);
      if (data?.rideId) {
        setRideId(String(data.rideId));
      }
    });

    // backend will notify the driver that OTP was sent to the user (without revealing OTP)
    socketRef.current.on("otp:sent-to-user", (data) => {
      console.log("✅ otp:sent-to-user event", data);
      setOtpSentToUser(true);
      setArrivalNotified(true);
      alert("OTP generated and sent to rider. Please ask the rider for the code and enter it to start the journey.");
    });

    socketRef.current.on("otp:confirmed", (data) => {
      console.log("✅ otp:confirmed event", data);
      if (data?.rideId && String(data.rideId) === String(rideId) && data.success) {
        setJourneyStarted(true);
        alert("OTP confirmed — journey started");
        navigate("/driverdestination")  
      }
    });

    return () => {
      if (!socketRef.current) return;
      socketRef.current.off("connect", onConnect);
      socketRef.current.off("user:location");
      socketRef.current.off("driver:location");
      socketRef.current.off("ride:accepted");
      socketRef.current.off("driver:arrived");
      socketRef.current.off("otp:confirmed");
    };
  }, [socketRef, rideId, driverEmail]);

  // Ensure we join the ride room once rideId and driverEmail are available
  useEffect(() => {
    if (!socketRef.current || !rideId || !driverEmail) {
      console.log("⏳ Waiting to join room...", { 
        socketReady: socketRef.current?.connected, 
        rideId, 
        driverEmail 
      });
      return;
    }

    try {
      socketRef.current.emit("ride:join", { rideId, role: "driver", email: driverEmail });
      console.log("✅ Emitted ride:join for room:", rideId, "driver email:", driverEmail);
    } catch (err) {
      console.warn("❌ Could not emit ride:join:", err);
    }
  }, [rideId, driverEmail, socketRef]);

  // Driver location updates
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    let updateCount = 0;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverLocation(coords);

        if (socketRef.current && socketRef.current.connected && driverEmail && rideId) {
          // Emit driver location using backend expected event
          socketRef.current.emit("driver:location:update:onride", {
            rideId,
            socketid: socketRef.current.id,
            email: driverEmail,
            coordinates: coords,
          });
          updateCount++;
          console.log(`📍 Driver location emitted to server #${updateCount}:`, coords, "rideId:", rideId);
        } else {
          console.warn("Cannot emit driver location - missing conditions:", {
            socketConnected: socketRef.current?.connected,
            driverEmail,
            rideId,
          });
        }
      },
      () => setError("Unable to get location"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      console.log(`🛑 Stopped driver geolocation watch (sent ${updateCount} updates)`);
      navigator.geolocation.clearWatch(watcher);
    }
  }, [driverEmail, rideId, socketRef]);

  // Fetch route & distance
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
        setEta(Math.ceil(route.duration / 60)); // min
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

  // compute distance (km) between driver and user and detect arrival
  const haversineKm = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const h = sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  };

  useEffect(() => {
    if (!driverLocation || !userLocation || arrivedSent) return;
    const dKm = haversineKm(driverLocation, userLocation);
    // arrival threshold: treat as 0 km with a tiny tolerance (1 meter) to allow for GPS noise
    if (dKm <= 0.001) {
      setArrivalReady(true);
    }
  }, [driverLocation, userLocation, arrivedSent, rideId, driverEmail]);

  // alert driver when within arrival threshold (shown once)
  useEffect(() => {
    if (arrivalReady && !arrivalAlerted) {
      setArrivalAlerted(true);
      alert("You have reached the rider's location. You can now generate OTP to verify pickup.");
    }
  }, [arrivalReady, arrivalAlerted]);

  // Driver clicks this to generate OTP and notify rider
  const handleGenerateOtp = () => {
    if (!socketRef.current || !socketRef.current.connected) return;
    if (!rideId) return;
    try {
      socketRef.current.emit("driver:arrived", { rideId, email: driverEmail });
      setArrivedSent(true);
      // arrivalNotified will be set when backend emits the arrival event back to the room
    } catch (err) {
      console.warn("Error emitting driver:arrived", err);
    }
  };

  const handleDriverConfirmOtp = (e) => {
    e?.preventDefault?.();
    if (!socketRef.current || !rideId || !otpInputDriver) return;
    try {
      socketRef.current.emit("otp:confirm", { rideId, otp: otpInputDriver });
    } catch (err) {
      console.warn("Error emitting otp:confirm", err);
    }
  };

  const center = driverLocation || userLocation || { lat: 11.9635, lng: 75.3208 };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <Navbar />
      <div className="relative mt-2 m-2 w-auto h-[350px] md:w-[50%] md:ml-[560px] rounded-2xl overflow-hidden shadow-lg border border-gray-300 bg-white">
        {journeyStarted && distance && eta && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-3 rounded shadow-lg text-sm font-bold z-10">
            <div>✅ OTP Confirmed - Journey Started</div>
            <div className="text-xs mt-1">📍 {distance} km to destination | ⏱ {eta} min</div>
          </div>
        )}

        {distance && eta && !journeyStarted && (
          <div className="absolute top-2 left-2 bg-orange-400 text-white px-4 py-3 rounded shadow-lg text-sm font-bold z-10">
            <div>� Heading to Pickup</div>
            <div className="text-xs mt-1">📍 {distance} km away | ⏱ {eta} min</div>
          </div>
        )}

        {error && <p className="text-red-500 text-center py-4 font-medium">{error}</p>}

        {(driverLocation || userLocation) && (
          <MapContainer center={center} zoom={13} className="z-0 h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />

            {driverLocation && (
              <>
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
                  <Popup>You (Driver) 🚗</Popup>
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
                  <Popup>User 📍</Popup>
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
        )}

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
              <span>👤 User: </span>
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

        {/* Arrival / OTP controls for driver */}
        <div className="absolute bottom-24 left-2 right-2 p-3 rounded text-sm z-20 pointer-events-auto">
          {arrivalReady && !arrivedSent && (
            <div className="flex justify-center">
              <button
                onClick={handleGenerateOtp}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow-md"
              >
                Generate OTP & Notify Rider
              </button>
            </div>
          )}
          {otpSentToUser && !journeyStarted && (
            <div className="mt-2 bg-white p-3 rounded shadow-md text-gray-900 w-full md:w-1/2 mx-auto">
              <div className="mb-2 font-semibold">OTP sent to rider</div>
              <div className="text-sm mb-2">Ask the rider for the 4-digit OTP and enter it below to confirm pickup.</div>
              <form onSubmit={handleDriverConfirmOtp} className="flex gap-2">
                <input
                  value={otpInputDriver}
                  onChange={(e) => setOtpInputDriver(e.target.value)}
                  className="p-2 border rounded w-full"
                  placeholder="Enter OTP to confirm"
                />
                <button className="px-3 py-2 bg-green-600 text-white rounded">Confirm</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RidingLocation;
