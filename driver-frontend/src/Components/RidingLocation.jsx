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
      if (data?.rideId && String(data.rideId) === String(rideId)) {
        if(data.success){
        setJourneyStarted(true);
        alert("OTP confirmed — journey started");
        // navigate("/driverdestination")  
      if (rideId) {
            window.location.href = `/driverdestination?rideId=${rideId}`;
          } else {
            window.location.href = "/driverdestination";
          }
        } else {
          alert("❌ OTP verified incorrectly. Please try again.");
        }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white flex flex-col">
      <Navbar />

      {/* animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-700 opacity-30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 right-0 w-96 h-96 bg-amber-600 opacity-20 rounded-full blur-2xl animate-blob animation-delay-2000" />
      </div>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map area */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-lg h-[60vh] md:h-[80vh]">
            {(driverLocation || userLocation) ? (
              <MapContainer center={center} zoom={13} className="h-full w-full">
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
                      radius={6}
                      color="#60a5fa"
                      fill={true}
                      fillColor="#60a5fa"
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
                      radius={7}
                      color="#fb7185"
                      fill={true}
                      fillColor="#fb7185"
                      fillOpacity={0.5}
                    />
                  </>
                )}

                {routeCoords.length > 0 && (
                  <Polyline positions={routeCoords} color="#60a5fa" weight={4} opacity={0.85} />
                )}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-300">
                Waiting for location data...
              </div>
            )}
          </div>

          {/* Side status / controls */}
          <aside className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow">
              <h3 className="text-lg font-semibold">Trip Status</h3>
              <p className="text-sm text-gray-200 mt-2">Ride ID: <span className="font-mono text-xs text-gray-100">{rideId || '—'}</span></p>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>🚗 Driver</span>
                  <span className={driverLocation ? 'text-green-300' : 'text-red-300'}>{driverLocation ? 'Connected' : 'Waiting'}</span>
                </div>
                <div className="flex justify-between">
                  <span>👤 Rider</span>
                  <span className={userLocation ? 'text-green-300' : 'text-red-300'}>{userLocation ? 'Connected' : 'Waiting'}</span>
                </div>
                <div className="flex justify-between">
                  <span>🗺️ Route</span>
                  <span className={routeCoords.length > 0 ? 'text-green-300' : 'text-yellow-300'}>{routeCoords.length > 0 ? 'Active' : 'Loading'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow flex flex-col gap-3">
              <h4 className="font-semibold">Trip Info</h4>
              <div className="flex justify-between text-sm text-gray-200">
                <div>Distance</div>
                <div className="font-medium">{distance ?? '—'} km</div>
              </div>
              <div className="flex justify-between text-sm text-gray-200">
                <div>ETA</div>
                <div className="font-medium">{eta ?? '—'} min</div>
              </div>

              {journeyStarted && (
                <div className="mt-2 px-3 py-2 rounded bg-gradient-to-r from-sky-600 to-cyan-500 text-white text-sm">✅ Journey started</div>
              )}
            </div>

            <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow">
              <h4 className="font-semibold">Controls</h4>

              {error && <p className="text-red-300 text-sm mt-2">{error}</p>}

              <div className="mt-3 flex flex-col gap-2">
                {arrivalReady && !arrivedSent && (
                  <button onClick={handleGenerateOtp} className="w-full py-2 rounded bg-gradient-to-r from-orange-500 to-yellow-400 text-slate-900 font-semibold">Generate OTP & Notify Rider</button>
                )}

                {otpSentToUser && !journeyStarted && (
                  <form onSubmit={handleDriverConfirmOtp} className="flex gap-2">
                    <input
                      value={otpInputDriver}
                      onChange={(e) => setOtpInputDriver(e.target.value)}
                      className="flex-1 p-2 rounded bg-white/10 border border-white/12 placeholder:text-gray-300"
                      placeholder="Enter OTP"
                    />
                    <button className="px-3 py-2 rounded bg-emerald-500 text-white">Confirm</button>
                  </form>
                )}
              </div>
            </div>

            <div className="text-xs text-center text-gray-300 mt-2">Keep app open to share live location with rider.</div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default RidingLocation;
