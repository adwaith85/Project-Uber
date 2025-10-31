import React, { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar'
import CurrentLocationMap from './CurrentLocationMap'
import { useLocation } from "react-router-dom"

// Haversine formula to calculate distance (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(2) // distance in km
}

function BookRide() {
  const [drivers, setDrivers] = useState([])
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const lat = parseFloat(params.get("lat"))
  const lng = parseFloat(params.get("lng"))
  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [pickupTime, setPickupTime] = useState("")
  const timeInputRef = useRef(null)

  // Fetch nearby drivers
  useEffect(() => {
    if (lat && lng) {
      fetch(`http://localhost:8080/nearby?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(data => setDrivers(data.drivers || []))
        .catch(err => console.error("Error fetching drivers:", err))
    }
  }, [lat, lng])

  // Handle selecting driver — show only that driver’s location
  const handleSelectDriver = async (driverId) => {
    try {
      const res = await fetch(`http://localhost:8080/driverlocation/${driverId}`)
      const data = await res.json()
      if (data?.location?.coordinates) {
        const [driverLng, driverLat] = data.location.coordinates
        setSelectedDriver(data)
        setCurrentLocation({ lat: driverLat, lng: driverLng }) // Show only chosen driver on map
      }
    } catch (error) {
      console.error("Error fetching driver location:", error)
    }
  }

  // Open clock on button click
  const openTimePicker = () => {
    if (timeInputRef.current) {
      timeInputRef.current.showPicker()
    }
  }

  // Handle booking
  const handleBookRide = () => {
    if (!selectedDriver) {
      alert("Please select a driver first.")
      return
    }
    alert(`Ride booked with ${selectedDriver?.name || "selected driver"} at ${pickupTime || "current time"}`)
  }

  return (
    <>
      <Navbar />

      {/* Map Section */}
      <div className="w-full bg-gray-50">
        {/* Only show selected driver location */}
        <CurrentLocationMap currentLocation={currentLocation} />
      </div>

      {/* Driver Cards Section */}
      <div className="w-full p-4">
        {lat && lng && (
          <p className="text-gray-700 mb-4 text-sm md:text-base text-center">
            Uber found within 5km radius of <strong>latitude:</strong> {lat}, <strong>longitude:</strong> {lng}
          </p>
        )}

        {drivers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {drivers.map((d) => {
              const driverLat = d?.location?.coordinates?.[1]
              const driverLng = d?.location?.coordinates?.[0]
              const distance = calculateDistance(lat, lng, driverLat, driverLng)

              return (
                <div
                  key={d._id}
                  className="flex justify-between items-center bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={d.profileimg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt="Driver"
                      className="w-14 h-14 rounded-full border"
                    />
                    <div className="flex flex-row flex-wrap gap-6 text-gray-700 text-sm">
                      <span><strong>Name:</strong> {d.name}</span>
                      <span><strong>📞</strong> {d.number}</span>
                      <span><strong>🚘</strong> {d.cartype || "Unknown"}</span>
                      <span><strong>🔢</strong> {d.carnumber}</span>
                      {distance && <span><strong>📍</strong> {distance} km away</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectDriver(d._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No drivers found within 5 km radius.</p>
        )}
      </div>

      {/* Buttons Section */}
      <div className='border-white rounded-2xl'>
        <h2 className='px-[28px] py-[14px] font-bold text-xl md:ml-10'>Get a ride</h2>

        <div className="flex gap-2 p-4 -ml-2 md:ml-5">
          {/* Hidden time input */}
          <input
            ref={timeInputRef}
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="hidden"
          />

          {/* Pickup now button shows selected time */}
          <button
            onClick={openTimePicker}
            className='border-none rounded-3xl bg-gray-200 text-sm text-gray ml-5 h-10 w-30'
          >
            {pickupTime ? `Pickup at ${pickupTime}` : "Pickup now"}
          </button>

          {/* Book ride button */}
          <button
            onClick={handleBookRide}
            className='border-none rounded-3xl bg-gray-200 text-sm text-gray ml-5 h-10 w-30'
          >
            Book Ride
          </button>
        </div>
      </div>
    </>
  )
}

export default BookRide
