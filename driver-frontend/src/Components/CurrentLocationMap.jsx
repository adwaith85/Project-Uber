import React, { useState, useEffect } from 'react';
import { FaCar } from "react-icons/fa";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const CurrentLocationMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAckZqFHLtXwxQuaIrxkByBZTq2XUqywNg', // Replace with your API key
  });

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
          setError('Unable to retrieve location');
          console.error(err);
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      {error && <p>{error}</p>}
      {location ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={15}
        >
          <Marker
            position={location}
            icon={{
              url: "/car.png",
              scaledSize: new window.google.maps.Size(50, 50),
              rotation: 90, // angle in degrees
            }}
            options={{
              icon: {
                url: "/car.png",
                scaledSize: new window.google.maps.Size(50, 50),
                rotation: 90,
                anchor: new window.google.maps.Point(25, 25),
              },
            }}
          />
        </GoogleMap>
      ) : (
        <p>Fetching current location...</p>
      )}
    </div>
  );
};

export default CurrentLocationMap