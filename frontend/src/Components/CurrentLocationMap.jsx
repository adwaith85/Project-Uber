import React, { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const CurrentLocationMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError("Unable to retrieve location");
          console.error(err);
        }
      );
    } else {
      setError("Geolocation not supported");
    }
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}
      {location ? (
        <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={15}>
          <Marker
            position={location}
            icon={{
              url: "/car.png",
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 25),
            }}
          />
        </GoogleMap>
      ) : (
        <p>Fetching current location...</p>
      )}
    </div>
  );
};

export default CurrentLocationMap;
