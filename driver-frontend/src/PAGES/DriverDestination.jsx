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
  const[eta,setEta]=useState(null);

  // update ride status
  const markRideComplete = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
        const rideId = params.get("rideId");

      const res = await fetch(`http://localhost:8080/ridecomplete/${rideId}`);
      if (res.ok) {
        alert("Ride marked as completed!.....ready for next ride");
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
      
      <div className="m-2 rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
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
      {distance && eta &&  (
        
          <div className="absolute top-2 left-2 bg-orange-400 text-white px-4 py-3 rounded shadow-lg text-sm font-bold z-10">
            <div>� Heading to Pickup</div>
            <div className="text-xs mt-1">📍 {distance} km away | ⏱ {eta} min</div>
            
          </div>
        )}
        {
            distance&& Number(distance)<=0.5 && <>
            <div>
                <div className="fixed inset-0 bg-black/40 backdrop-brightness-50  z-[100]" />
                <div className=" fixed top-70 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[90%] md:w-[400px] p-6 rounded-2xl shadow-2xl flex flex-col items-center z-[300] ">
                  <h2 className="text-xl font-bold mb-4">Ride Completed!</h2>
                  <p className="text-center">You have arrived at the Destination . Please confirm to mark the ride as complete.</p>
                  <button 
                onClick={()=>{
                  markRideComplete()
                  navigate('/home')
                }}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg text-xs"
                >
                Mark as Completed
                </button>
            </div>
                </div>
              </>
            }
    </>
  );
};

export default DriverDestination;
