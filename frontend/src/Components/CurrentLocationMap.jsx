import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

// default leaflet icons
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
  iconUrl: "/vite.svg", // highlight icon
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

const userIcon = new L.Icon({
  iconUrl: "/user.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Fit bounds automatically
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

// Smooth follow effect
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
  center,
  currentLocation,
  pickupLocation,
  dropoffLocation,
  route,
  drivers = [],
  selectedDriver,
  selectedDriverLocation,
  locdriver,
  drivermarkers
}) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (locdriver && locdriver.length === 2) {
      const [lng, lat] = locdriver;
      setDriverLocation({ lat, lng });
    }
  }, [locdriver]);

  // socket.io live driver updates
  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("driver:location", (location) => {
      if (location?.lat && location?.lng) {
        setDriverLocation(location);
      }
    });

    return () => socketRef.current.disconnect();
  }, []);

  const mapCenter = center ? [center.lat, center.lng] : [11.9635, 75.3208];

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} className="h-[400px] w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected / Live Driver Marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>Driver 🚗 (Live)</Popup>
          </Marker>
        )}

        {/* Render all drivers */}
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
              ref={(el) => {
                if (el) drivermarkers.current[d._id] = el;
              }}
            >
              <Popup>
                <strong>{d.name}</strong><br />
                {d.cartype || "Unknown"}<br />
                {/* {d.carnumber && `Car No: ${d.carnumber}`}<br /> */}
                📞 {d.number}
              </Popup>
            </Marker>
          );
        })}

        <FitBounds
          route={route}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          currentLocation={currentLocation}
        />
        <FollowDriver driverLocation={driverLocation || selectedDriverLocation} />
      </MapContainer>
    </div>
  );
};

export default CurrentLocationMap;