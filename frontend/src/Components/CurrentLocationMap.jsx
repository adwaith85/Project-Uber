import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const startIcon = new L.Icon({
  iconUrl: "/start.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const dropIcon = new L.Icon({
  iconUrl: "/drop.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const driverIcon = new L.Icon({
  iconUrl: "/carimg.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const selectedDriverIcon = new L.Icon({
  iconUrl: "/vite.svg", // highlight version
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

const userIcon = new L.Icon({
  iconUrl: "/user.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Fit all points in bounds
function FitBounds({ route, pickupLocation, dropoffLocation, currentLocation }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = [
      ...(route?.filter(p => p?.lat && p?.lng).map(p => [p.lat, p.lng]) || []),
      pickupLocation?.lat && pickupLocation?.lng ? [pickupLocation.lat, pickupLocation.lng] : null,
      dropoffLocation?.lat && dropoffLocation?.lng ? [dropoffLocation.lat, dropoffLocation.lng] : null,
      currentLocation?.lat && currentLocation?.lng ? [currentLocation.lat, currentLocation.lng] : null,
    ].filter(Boolean);

    if (validPoints.length >= 2) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (validPoints.length === 1) {
      map.flyTo(validPoints[0], 14, { animate: true });
    }
  }, [route, pickupLocation, dropoffLocation, currentLocation, map]);

  return null;
}

// Smooth driver-follow feature
function FollowDriver({ driverLocation }) {
  const map = useMap();
  const prevLocation = useRef(null);

  useEffect(() => {
    if (!driverLocation) return;
    const prev = prevLocation.current;
    if (
      !prev ||
      Math.abs(driverLocation.lat - prev.lat) > 0.0003 ||
      Math.abs(driverLocation.lng - prev.lng) > 0.0003
    ) {
      map.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
      prevLocation.current = driverLocation;
    }
  }, [driverLocation, map]);

  return null;
}

const CurrentLocationMap = ({
  currentLocation,
  pickupLocation,
  dropoffLocation,
  route,
  drivers = [],
  selectedDriver,
  selectedDriverLocation,
}) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);

  // Connect to Socket.IO for driver location updates
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to Socket.IO:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO");
    });

    socketRef.current.on("driver:location", (location) => {
      if (location?.lat && location?.lng) {
        setDriverLocation(location);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const center =
    driverLocation
      ? [driverLocation.lat, driverLocation.lng]
      : currentLocation
        ? [currentLocation.lat, currentLocation.lng]
        : pickupLocation
          ? [pickupLocation.lat, pickupLocation.lng]
          : dropoffLocation
            ? [dropoffLocation.lat, dropoffLocation.lng]
            : [11.9635, 75.3208]; // fallback: Kerala

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
      {center ? (
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          className="h-[400px] w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ User */}
          {/* {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>Your Location 🚶</Popup>
            </Marker>
          )} */}

          {/* ✅ Live driver location (socket.io) */}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>Driver 🚗</Popup>
            </Marker>
          )}

          {/* ✅ Pickup and Drop markers */}
          {pickupLocation && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={startIcon}>
              <Popup>Pickup 📍</Popup>
            </Marker>
          )}

          {dropoffLocation && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropIcon}>
              <Popup>Dropoff 🎯</Popup>
            </Marker>
          )}

          {/* ✅ Route Polyline */}
          {route && route.length > 0 && (
            <Polyline
              positions={route.map((p) => [p.lat, p.lng])}
              color="blue"
              weight={4}
              opacity={0.7}
            />
          )}

          {/* ✅ Show all drivers from backend */}
          {drivers?.map((d) => {
            const driverLat = d?.location?.coordinates?.[1];
            const driverLng = d?.location?.coordinates?.[0];
            if (!driverLat || !driverLng) return null;
            const isSelected = selectedDriver === d._id;

            return (
              <Marker
                key={d._id}
                position={[driverLat, driverLng]}
                icon={isSelected ? selectedDriverIcon : driverIcon}
              >
                <Popup>
                  <strong>{d.name}</strong><br />
                  {d.cartype || "Unknown"}<br />
                  {d.carnumber}
                </Popup>
              </Marker>
            );
          })}

          {/* ✅ Recenter map when route/points change */}
          <FitBounds
            route={route}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            currentLocation={currentLocation}
          />

          {/* ✅ Smooth follow on driver updates */}
          <FollowDriver driverLocation={driverLocation || selectedDriverLocation} />
        </MapContainer>
      ) : (
        <p className="text-center py-10 text-gray-500">Fetching current location...</p>
      )}
    </div>
  );
};

export default CurrentLocationMap;























// import React, { useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import io from "socket.io-client";
// import "leaflet/dist/leaflet.css";

// import iconUrl from "leaflet/dist/images/marker-icon.png";
// import iconShadow from "leaflet/dist/images/marker-shadow.png";

// const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
// L.Marker.prototype.options.icon = DefaultIcon;

// const startIcon = new L.Icon({
//   iconUrl: "/start.png",
//   iconSize: [50, 50],
//   iconAnchor: [25, 25],
// });

// const dropIcon = new L.Icon({
//   iconUrl: "/drop.png",
//   iconSize: [50, 50],
//   iconAnchor: [25, 25],
// });

// const driverIcon = new L.Icon({
//   iconUrl: "/carimg.png",
//   iconSize: [50, 50],
//   iconAnchor: [25, 25],
// });

// const userIcon = new L.Icon({
//   iconUrl: "/user.png", 
//   iconSize: [40, 40],
//   iconAnchor: [20, 20],
// });

// function FitBounds({ route, pickupLocation, dropoffLocation, currentLocation }) {
//   const map = useMap();

//   useEffect(() => {
//     const validPoints = [
//       ...(route?.filter(p => p?.lat && p?.lng).map(p => [p.lat, p.lng]) || []),
//       pickupLocation?.lat && pickupLocation?.lng ? [pickupLocation.lat, pickupLocation.lng] : null,
//       dropoffLocation?.lat && dropoffLocation?.lng ? [dropoffLocation.lat, dropoffLocation.lng] : null,
//       currentLocation?.lat && currentLocation?.lng ? [currentLocation.lat, currentLocation.lng] : null,
//     ].filter(Boolean);

//     if (validPoints.length >= 2) {
//       const bounds = L.latLngBounds(validPoints);
//       map.fitBounds(bounds, { padding: [50, 50] });
//     } else if (validPoints.length === 1) {
//       map.flyTo(validPoints[0], 14, { animate: true });
//     }
//   }, [route, pickupLocation, dropoffLocation, currentLocation, map]);

//   return null;
// }

// function FollowDriver({ driverLocation }) {
//   const map = useMap();
//   const prevLocation = useRef(null);

//   useEffect(() => {
//     if (!driverLocation) return;

//     const prev = prevLocation.current;
//     if (
//       !prev ||
//       Math.abs(driverLocation.lat - prev.lat) > 0.0003 ||
//       Math.abs(driverLocation.lng - prev.lng) > 0.0003
//     ) {
//       map.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
//       prevLocation.current = driverLocation;
//     }
//   }, [driverLocation, map]);

//   return null;
// }

// const CurrentLocationMap = ({ currentLocation, pickupLocation, dropoffLocation, route }) => {
//   const [driverLocation, setDriverLocation] = useState(null);
//   const socketRef = useRef(null);

//   // Connect to Socket.IO for driver location updates
//   useEffect(() => {
//     socketRef.current = io("http://localhost:8080", {
//       transports: ["websocket"],
//       reconnection: true,
//     });

//     socketRef.current.on("connect", () => {
//       console.log("✅ Connected to Socket.IO:", socketRef.current.id);
//     });

//     socketRef.current.on("disconnect", () => {
//       console.log("❌ Disconnected from Socket.IO");
//     });

//     socketRef.current.on("driver:location", (location) => {
//       if (location?.lat && location?.lng) {
//         setDriverLocation(location);
//       }
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   // const defaultCenter = [10.8505, 76.2711];

//   const center =
//     driverLocation
//       ? [driverLocation.lat, driverLocation.lng]
//       : currentLocation
//         ? [currentLocation.lat, currentLocation.lng]
//         : pickupLocation
//           ? [pickupLocation.lat, pickupLocation.lng]
//           : dropoffLocation
//             ? [dropoffLocation.lat, dropoffLocation.lng]
//             : [11.9635, 75.3208]; // fallback: kerala

//   return (
//     <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
//       {center ? (
//         <MapContainer
//           center={center}
//           zoom={12}
//           scrollWheelZoom={true}
//           className="h-[400px] w-full z-0"
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

//           {/* {currentLocation && (
//             <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
//               <Popup>Your Location 🚶</Popup>
//             </Marker>
//           )} */}

//           {driverLocation && (
//             <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
//               <Popup>Driver 🚗</Popup>
//             </Marker>
//           )}

//           {pickupLocation && (
//             <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={startIcon}>
//               <Popup>Pickup 📍</Popup>
//             </Marker>
//           )}

//           {dropoffLocation && (
//             <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropIcon}>
//               <Popup>Dropoff 🎯</Popup>
//             </Marker>
//           )}

//           {route && route.length > 0 && (
//             <Polyline
//               positions={route.map((p) => [p.lat, p.lng])}
//               color="blue"
//               weight={4}
//               opacity={0.7}
//             />
//           )}

//           <FitBounds
//             route={route}
//             pickupLocation={pickupLocation}
//             dropoffLocation={dropoffLocation}
//             currentLocation={currentLocation}
//           />
//           <FollowDriver driverLocation={driverLocation} />
//         </MapContainer>
//       ) : (
//         <p className="text-center py-10 text-gray-500">Fetching current location...</p>
//       )}
//     </div>
//   );
// };

// export default CurrentLocationMap;
