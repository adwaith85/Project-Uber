import React, { useState, useEffect, useRef } from 'react'
import CurrentLocationMap from './CurrentLocationMap'
import { useLocation } from "react-router-dom"
import NavbarX from "./NavbarX"
import TimerCountDown from './Timer'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from '../Api/Axiosclient'

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(2)
}

function BookRide() {
  const [drivers, setDrivers] = useState([])
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const lat = parseFloat(params.get("lat"))
  const lng = parseFloat(params.get("lng"))
  const distance = parseFloat(params.get("dis"))
  const pickup = params.get("pickup") || "Not selected"
  const dropoff = params.get("drop") || "Not selected"

  const [showCounter, setShowCounter] = useState({ showCounter: false, orderId: null })
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [selectedDriverName, setSelectedDriverName] = useState("")
  const [selectedDriverLocation, setSelectedDriverLocation] = useState(null)
  const [locdriver, setLocdriver] = useState(null)
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")
  const drivermarkers = useRef({})

  // Fetch nearby drivers
  useEffect(() => {
    if (lat && lng) {
      fetch(`http://localhost:8080/nearby?lat=${lat}&lng=${lng}&dis=${distance}`)
        .then(res => res.json())
        .then(data => setDrivers(data.drivers || []))
        .catch(err => console.error("Error fetching drivers:", err))
    }
  }, [lat, lng])

  const handleBookRide = async (e) => {
    e.preventDefault()

    if (!time || !selectedDriverName || !date) {
      alert("Please select a driver and pickup time.")
      return
    }

    try {
      const response = await api.post('/bookride', {
        driverId: selectedDriver,
        pickup,
        dropoff,
        driver: selectedDriverName,
        time,
        date,
        userLat: lat,
        userLng: lng,
        driverLat: selectedDriverLocation?.lat,
        driverLng: selectedDriverLocation?.lng,
      })

      const orderId = response.data.rideId
      console.log("Ride booked successfully:", orderId)

      // alert(`Ride booked with ${selectedDriverName} at ${time} and ${date}!`)

      // ✅ Now update state *after* the async call returns
      setShowCounter({ showCounter: true, orderId })
    } catch (error) {
      console.error("Error booking ride:", error)
      alert("Failed to book ride.")
    }
  }

  return (
    <div className='h-[100%] mb-8'>
      <NavbarX />

      {/* Map Section */}
      <div className="w-full bg-gray-50 p-2">
        <CurrentLocationMap
          center={{ lat, lng }}
          drivers={drivers}
          selectedDriver={selectedDriver}
          selectedDriverLocation={selectedDriverLocation}
          locdriver={locdriver}
          drivermarkers={drivermarkers}
        />
      </div>
      <div className="md:flex md:w-[100%]">
        {/* Driver List */}
        <div className="md:w-[100%] p-4 ">
          {lat && lng && (
            <p className="text-gray-700 mb-4 text-sm md:text-base md:w-[100%] md:mr-50 text-center">
              Uber found within 5km radius of <strong>latitude:</strong> {lat}, <strong>longitude:</strong> {lng}
            </p>
          )}

          {drivers.length > 0 ? (
            <div className=" flex flex-col gap-4">
              {drivers.map((d) => {
                const driverLat = d?.location?.coordinates?.[1]
                const driverLng = d?.location?.coordinates?.[0]
                const dis = calculateDistance(lat, lng, driverLat, driverLng)

                return (
                  <div
                    key={d._id}
                    className={`md:w-[100%] flex justify-between items-center bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow ${selectedDriver === d._id ? 'ring-2 ring-blue-500' : ''}`}>
                    <button
                      onClick={() => {
                        setSelectedDriver(d._id)
                        setSelectedDriverName(d.name)
                        setSelectedDriverLocation({
                          lat: d.location.coordinates[1],
                          lng: d.location.coordinates[0]
                        })
                        setLocdriver(d.location.coordinates)

                        const marker = drivermarkers.current[d._id]
                        if (marker) marker.openPopup()
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={d.profileimg ? `http://localhost:8080${d.profileimg}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                          alt="Driver"
                          className="w-14 h-14 rounded-full border"
                        />
                        <div className="flex flex-row flex-wrap gap-3 text-gray-700 text-sm">
                          <span><strong>Name:</strong> {d.name}</span>
                          <span><strong>📞</strong> {d.number}</span>
                          <span><strong>🚘</strong> {d.cartype || "Unknown"}</span>
                          <span><strong>🔢</strong> {d.carnumber}</span>
                          {dis && <span><strong>📍</strong> {dis} km away</span>}
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No drivers found within 5 km radius.</p>
          )}
        </div>

        {/* Show Timer if Ride Booked */}
        <div className="w-[100%]">
          {showCounter.showCounter ? (
            <TimerCountDown orderId={showCounter.orderId} setCounter={setShowCounter} />
          ) : (
            <div className='border-white rounded-2xl md:mt-[0px] md:w-[100%]'>
              <h2 className='px-[28px] py-[14px] font-bold text-xl md:ml-82 md:mb-4'>Get a ride</h2>
              <div className="bg-white mx-6 md:mx-10 mb-6 p-6 rounded-2xl shadow-lg md:ml-20">
                <form onSubmit={handleBookRide} className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-600 text-sm font-medium">From</label>
                      <input type="text" value={pickup} readOnly className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700" />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-600 text-sm font-medium">To</label>
                      <input type="text" value={dropoff} readOnly className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium">Driver</label>
                      <input
                        type="text"
                        value={selectedDriverName || "No driver selected"}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-gray-600 text-sm font-medium mb-1">Distance to Travel</label>
                      <div className="flex items-center border border-gray-300 rounded-lg p-2 text-gray-700 bg-white">
                        <span className="flex-1">{distance || "not found"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="flex flex-col">
                      <label className="block text-gray-600 text-sm font-medium mb-1">Pickup Time</label>
                      <DatePicker
                        selected={time}
                        onChange={(t) => setTime(t)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Select time"
                        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        popperPlacement="bottom-start"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-gray-600 text-sm font-medium mb-1">Pickup Date</label>
                      <DatePicker
                        selected={date} // only when value has changed
                        onChange={(t)=>setDate(t)}
                        minDate={new Date()} // ⬅️ disables all days before today
                        dateFormat="yyyy/MM/dd"
                        placeholderText="Select date"
                        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        popperPlacement="bottom-start"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 mt-3 transition-all"
                  >
                    Book Ride
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookRide