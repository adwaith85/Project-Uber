import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// removed leaflet-routing-machine to avoid its UI and markers
import { useNavigate } from "react-router-dom";

const userIcon = new L.Icon({
  iconUrl: "/car.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const destinationIcon = new L.Icon({
  iconUrl: "/drop.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// We'll fetch a route geometry (GeoJSON) from OSRM and draw it as a Polyline

const DriverDestination = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  // update ride status
  const markRideComplete = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rideId = params.get("rideId");

      const res = await fetch(`http://localhost:8080/ridecomplete/${rideId}`);
      if (res.ok) {
        // alert("Ride marked as completed!.....ready for next ride");
        navigate("/home")
      }
    } catch (err) {
      console.log("Error marking ride complete:", err);
    }
  };

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
        // Use dropoff coordinates stored as GeoJSON Point in database
        if (trip.dropoffLocation && trip.dropoffLocation.coordinates && trip.dropoffLocation.coordinates.length === 2) {
          const [lng, lat] = trip.dropoffLocation.coordinates;
          setDropoffLocation({ lat: Number(lat), lng: Number(lng) });
        } else {
          console.warn("No dropoffLocation coordinates found in trip data:", trip);
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
    <div className="min-h-screen bg-gray-400 text-black flex flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gray-100 opacity-30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-28 right-0 w-96 h-96 bg-gray-100 opacity-20 rounded-full blur-2xl animate-blob animation-delay-2000" />
      </div>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white/50 backdrop-blur-lg border border-black rounded-2xl overflow-hidden shadow-lg h-[60vh] md:h-[80vh]">
            <MapContainer
              center={[center.lat || center[0], center.lng || center[1]]}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
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
                <Polyline positions={routeCoords} pathOptions={{ color: "#60a5fa", weight: 5 }} />
              )}
            </MapContainer>
          </section>

          <aside className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-gray-600 backdrop-blur-md border border-black rounded-xl p-4 shadow">
              <h3 className="text-lg text-black font-semibold">Destination</h3>
              <p className="text-sm text- mt-2">Drop-off coordinates:</p>
              <p className="text-xs font-mono text-gray-200 mt-2">{dropoffLocation ? `${dropoffLocation.lat}, ${dropoffLocation.lng}` : 'Not available'}</p>
            </div>

            <div className="bg-gray-600 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow">
              <h4 className="font-semibold">Trip Info</h4>
              <div className="flex justify-between mt-2 text-sm text-yellow-500">
                <div>Distance</div>
                <div className="font-medium">{distance ?? '—'} km</div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-yellow-400">
                <div>ETA</div>
                <div className="font-medium">{eta ?? '—'} min</div>
              </div>
            </div>

            <div className="bg-gray-600 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow flex flex-col items-center gap-3">
              <p className="text-sm text-gray-100 text-center">When you arrive, confirm to mark the ride complete.</p>
              {/* <button onClick={markRideComplete} className="w-full py-2 rounded bg-gradient-to-r from-emerald-500 to-green-400 text-slate-900 font-semibold">Mark as Completed</button> */}
            </div>

            <div className="text-xs text-center text-gray-100 mt-2">Auto-fit applied to route when available.</div>
          </aside>
        </div>
      </main>

      {/* Completion modal shown when close to destination */}
      {distance && Number(distance) <= 0.5 && (
        <div>
          <div className="fixed inset-0 bg-black/40 z-[100]" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 w-[90%] md:w-[420px] p-6 rounded-2xl shadow-2xl z-[300]">
            <h2 className="text-xl text-center font-bold mb-4">Ride Completed!</h2>
            <p className="text-center">You have arrived at the destination. Please confirm to mark the ride as complete.</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  markRideComplete();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDestination;
