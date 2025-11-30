import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Confetti from "react-confetti";
import NavbarX from "../Components/NavbarX";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Navigation, Star, X, CheckCircle, Send } from "lucide-react";
import useWindowSize from 'react-use/lib/useWindowSize';

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
  const [hoveredStar, setHoveredStar] = useState(0);
  const { width, height } = useWindowSize();

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

        if (trip.dropoffLocation && trip.dropoffLocation.coordinates && trip.dropoffLocation.coordinates.length === 2) {
          const [lng, lat] = trip.dropoffLocation.coordinates;
          setDropoffLocation({ lat: Number(lat), lng: Number(lng) });
          return;
        }

        if (trip.dropoffLat && trip.dropoffLng) {
          setDropoffLocation({ lat: Number(trip.dropoffLat), lng: Number(trip.dropoffLng) });
          return;
        }

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

  // Fetch route from OSRM
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
          setDistance((route.distance / 1000).toFixed(2));
          setEta(Math.ceil(route.duration / 60));

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

  const handleSubmitFeedback = () => {
    console.log("Rating:", rating);
    console.log("Feedback:", feedback);
    // Here you would typically send this to your backend
    setShowFeedback(false);
    navigate('/UserHome');
  };

  return (
    <>
      <NavbarX />

      <div className="min-h-screen bg-gray-50 pt-[70px]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Current Location */}
            <div className={`rounded-xl p-4 ${currentLocation ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-100 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentLocation ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current Location</p>
                  <p className={`font-bold ${currentLocation ? 'text-blue-700' : 'text-gray-500'}`}>
                    {currentLocation ? '✓ Tracking' : '⏳ Loading...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className={`rounded-xl p-4 ${dropoffLocation ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-100 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dropoffLocation ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Destination</p>
                  <p className={`font-bold ${dropoffLocation ? 'text-green-700' : 'text-gray-500'}`}>
                    {dropoffLocation ? '✓ Set' : '⏳ Loading...'}
                  </p>
                </div>
              </div>
            </div>

            {/* ETA */}
            <div className={`rounded-xl p-4 ${distance && eta ? 'bg-amber-50 border-2 border-amber-200' : 'bg-gray-100 border-2 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${distance && eta ? 'bg-amber-500' : 'bg-gray-400'}`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">ETA</p>
                  <p className={`font-bold ${distance && eta ? 'text-amber-700' : 'text-gray-500'}`}>
                    {distance && eta ? `${eta} min` : 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Journey Banner */}
            {distance && eta && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-lg">En Route to Destination</p>
                      <p className="text-sm text-blue-100">Follow the blue route on the map</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{distance} km</p>
                    <p className="text-sm text-blue-100">{eta} min away</p>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <MapContainer
              center={[center.lat || center[0], center.lng || center[1]]}
              zoom={13}
              scrollWheelZoom
              className="h-[500px] w-full z-0"
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
        </div>
      </div>

      {/* Feedback Modal */}
      {distance && Number(distance) <= 0.5 && showFeedback && (
        <>
          {/* Confetti - Professional look */}
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']}
          />

          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />

          {/* Feedback Card */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-[200]">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
                <button
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  onClick={() => {
                    setShowFeedback(false);
                    navigate('/UserHome');
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Trip Completed!</h2>
                    <p className="text-green-100 text-sm">You've arrived at your destination</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Rating Section */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-3">
                    How was your ride?
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${star <= (hoveredStar || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                            } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                    </p>
                  )}
                </div>

                {/* Feedback Textarea */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Share your experience (Optional)
                  </label>
                  <textarea
                    className="w-full h-28 border-2 border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:outline-none resize-none"
                    placeholder="Tell us about your trip..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitFeedback}
                  disabled={rating === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${rating > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your feedback helps us improve our service
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
};

export default Destination;
