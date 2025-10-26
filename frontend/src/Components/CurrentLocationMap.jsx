import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom car icon
const carIcon = new L.Icon({
  iconUrl: "/car.png", // Make sure this exists in /public folder
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

// Component to recenter map when location changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

const CurrentLocationMap = ({ currentLocation, pickupLocation, dropoffLocation }) => {
  // Determine map center: currentLocation > pickup > dropoff
  const center = currentLocation || pickupLocation || dropoffLocation || [0, 0];

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mt-4">
      {center ? (
        <MapContainer center={center} zoom={15} style={{ height: "400px", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Current Location Marker */}
          {currentLocation && (
            <Marker position={currentLocation} icon={carIcon}>
              <Popup>Your Current Location 🚗</Popup>
            </Marker>
          )}

          {/* Pickup Marker */}
          {pickupLocation && (
            <Marker position={pickupLocation}>
              <Popup>Pickup Location 📍</Popup>
            </Marker>
          )}

          {/* Dropoff Marker */}
          {dropoffLocation && (
            <Marker position={dropoffLocation}>
              <Popup>Dropoff Location 🎯</Popup>
            </Marker>
          )}

          {/* Recenter map on location change */}
          <RecenterMap center={center} />
        </MapContainer>
      ) : (
        <p className="text-center py-10 text-gray-500">Fetching current location...</p>
      )}
    </div>
  );
};

export default CurrentLocationMap;















// import React, { useState, useEffect } from "react";
// import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Create a custom car icon (make sure /public/car.png exists)
// const carIcon = new L.Icon({
//   iconUrl: "/car.png",
//   iconSize: [50, 50],
//   iconAnchor: [25, 25],
// });

// const MapUpdater = ({ location }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (location) {
//       map.setView(location, 15, { animate: true });
//     }
//   }, [location, map]);
//   return null;
// };

// const CurrentLocationMap = () => {
//   const [location, setLocation] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (err) => {
//           setError("Unable to retrieve location");
//           console.error(err);
//         }
//       );
//     } else {
//       setError("Geolocation not supported");
//     }
//   }, []);

//   return (
//     <div className="rounded-2xl overflow-hidden shadow-md mt-4">
//       {error && <p className="text-red-500 text-center">{error}</p>}
//       {location ? (
//         <MapContainer
//           center={[location.lat, location.lng]}
//           zoom={15}
//           style={{ height: "400px", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
//           />
//           <Marker position={[location.lat, location.lng]} icon={carIcon}  />
//           <MapUpdater location={location} />
//         </MapContainer>
//       ) : (
//         <p className="text-center py-10 text-gray-500">
//           Fetching current location...
//         </p>
//       )}
//     </div>
//   );
// };

// export default CurrentLocationMap;
