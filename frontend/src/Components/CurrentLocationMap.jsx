import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const userIcon = new L.Icon({
  iconUrl: "/person1.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const carIcon = new L.Icon({
  iconUrl: "/droped.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

function FitBounds({ route, pickupLocation, dropoffLocation, currentLocation }) {
  const map = useMap();

  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupLocation && dropoffLocation) {
      const bounds = L.latLngBounds([
        [pickupLocation.lat, pickupLocation.lng],
        [dropoffLocation.lat, dropoffLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (currentLocation) {
      map.flyTo([currentLocation.lat, currentLocation.lng], 14, { animate: true });
    }
  }, [route, pickupLocation, dropoffLocation, currentLocation, map]);

  return null;
}

const CurrentLocationMap = ({ currentLocation, pickupLocation, dropoffLocation, route }) => {
  const center =
    currentLocation
      ? [currentLocation.lat, currentLocation.lng]
      : pickupLocation
        ? [pickupLocation.lat, pickupLocation.lng]
        : dropoffLocation
          ? [dropoffLocation.lat, dropoffLocation.lng]
          : [20.5937, 78.9629];

  return (
    <div className="rounded-2xl overflow-hidden shadow-md mt-4 md:w-[100%]">
      {center ? (
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={true}
          className="h-[400px] w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>Your Current Location 🚗</Popup>
            </Marker>
          )}

          {pickupLocation && (
            <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={userIcon}>
              <Popup>Pickup Location 📍</Popup>
            </Marker>
          )}

          {dropoffLocation && (
            <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={carIcon}>
              <Popup>Dropoff Location 🎯</Popup>
            </Marker>
          )}

          {route && route.length > 0 && (
            <Polyline
              positions={route.map((p) => [p.lat, p.lng])}
              color="blue"
              weight={4}
              opacity={0.7}
            />
          )}

          <FitBounds
            route={route}
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            currentLocation={currentLocation}
          />
        </MapContainer>
      ) : (
        <p className="text-center py-10 text-gray-500">
          Fetching current location...
        </p>
      )}
    </div>
  );
};

export default CurrentLocationMap;
