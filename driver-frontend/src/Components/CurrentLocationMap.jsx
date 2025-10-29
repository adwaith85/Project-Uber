import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

// 🚗 Custom car icon
const carIcon = new L.Icon({
  iconUrl: "/car.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
};

const CurrentLocationMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // 🔌 Connect to socket server
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("🚗 Client connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Client disconnected:", socketRef.current.id);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 📍 Watch live location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation([coords.lat, coords.lng]);

        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("location:update", coords);
        }
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location");
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return (
    <div className="fixed w-[90%] h-[350px] rounded-2xl overflow-hidden shadow-lg border border-gray-300 bg-white md:w-[50%] md:right-8">
      {error && (
        <p className="text-red-500 text-center py-4 font-medium md:right-6">{error}</p>
      )}

      {!location && !error && (
        <p className="text-gray-600 text-center py-4 font-medium md:right-6">
          Fetching current location...
        </p>
      )}

      {location && (
        <MapContainer
          center={location}
          zoom={15}
          className="h-full w-[100%] rounded-2xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <Marker position={location} icon={carIcon}>
            <Popup>You are here 🚗</Popup>
          </Marker>
          <RecenterMap position={location} />
        </MapContainer>
      )}
    </div>
  );
};

export default CurrentLocationMap;





















// // CurrentLocationMap.jsx
// import React, { useEffect, useState, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import io from 'socket.io-client';
// import 'leaflet/dist/leaflet.css';

// // Custom car icon
// const carIcon = new L.Icon({
//   iconUrl: '/car.png',
//   iconSize: [50, 50],
//   iconAnchor: [25, 25],
// });

// const RecenterMap = ({ position }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (position) map.setView(position, map.getZoom(), { animate: true });
//   }, [position, map]);
//   return null;
// };

// const CurrentLocationMap = () => {
//   const [location, setLocation] = useState(null);
//   const [error, setError] = useState(null);
//   const socketRef = useRef(null); // ✅ keep socket persistent

//   useEffect(() => {
//     // Create socket connection
//     socketRef.current = io('http://localhost:8080', {
//       transports: ['websocket'], // Use websocket to avoid polling issues
//     });

//     socketRef.current.on('connect', () => {
//       console.log('🚗 Client connected:', socketRef.current.id);
//     });

//     socketRef.current.on('disconnect', () => {
//       console.log('❌ Client disconnected:', socketRef.current.id);
//     });

//     return () => {
//       socketRef.current.disconnect(); // Only disconnect on unmount
//     };
//   }, []);

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported by your browser');
//       return;
//     }

//     const watcher = navigator.geolocation.watchPosition(
//       (pos) => {
//         const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setLocation([coords.lat, coords.lng]);

//         // ✅ Send location updates to server
//         if (socketRef.current && socketRef.current.connected) {
//           socketRef.current.emit('location:update', coords);
//         }
//       },
//       (err) => {
//         console.error(err);
//         setError('Unable to retrieve your location');
//       },
//       { enableHighAccuracy: true }
//     );

//     return () => navigator.geolocation.clearWatch(watcher);
//   }, []);

//   return (
//     <div style={{ width: '100%', height: '400px' }}>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {location ? (
//         <MapContainer center={location} zoom={15} style={{ height: '100%', width: '100%' }}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           />
//           <Marker position={location} icon={carIcon}>
//             <Popup>You are here 🚗</Popup>
//           </Marker>
//           <RecenterMap position={location} />
//         </MapContainer>
//       ) : (
//         <p>Fetching current location...</p>
//       )}
//     </div>
//   );
// };

// export default CurrentLocationMap;
