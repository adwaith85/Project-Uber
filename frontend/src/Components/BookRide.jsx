import React, { useState, useEffect, useRef } from 'react'
import CurrentLocationMap from './CurrentLocationMap'
import { useLocation } from "react-router-dom"
import NavbarX from "./NavbarX"
import TimerCountDown from './Timer'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from '../Api/Axiosclient'
import { MapPin, Calendar, Clock, User, DollarSign, Navigation } from 'lucide-react'
import Footer from './Footer'

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
  const dropLat = parseFloat(params.get("dropLat"))
  const dropLng = parseFloat(params.get("dropLng"))
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
      fetch(`https://project-uber.onrender.com/nearby?lat=${lat}&lng=${lng}&dis=${distance}`)
        .then(res => res.json())
        .then(data => setDrivers(data.drivers || []))
        .catch(err => console.error("Error fetching drivers:", err))
    }
  }, [lat, lng, distance])

  const handleBookRide = async (e) => {
    e.preventDefault()

    if (!time || !selectedDriverName || !date) {
      alert("Please select a driver and pickup time.")
      return
    }

    try {
      // Calculate price: distance * driver's rate (if available, default to 10 per km)
      const driverRate = drivers.find(d => d._id === selectedDriver)?.distancerate || 10
      const price = distance ? (distance * driverRate).toFixed(2) : 0

      const response = await api.post('/bookride', {
        driverId: selectedDriver,
        pickup,
        dropoff,
        driver: selectedDriverName,
        time,
        date,
        userLat: lat,
        userLng: lng,
        dropoffLat: dropLat,
        dropoffLng: dropLng,
        driverLat: selectedDriverLocation?.lat,
        driverLng: selectedDriverLocation?.lng,
        distance: distance || 0,
        price: price,
      })

      const orderId = response.data.rideId
      console.log("Ride booked successfully:", orderId)

      // ✅ Now update state *after* the async call returns
      setShowCounter({ showCounter: true, orderId })
    } catch (error) {
      console.error("Error booking ride:", error)
      alert("Failed to book ride.")
    }
  }

  if (showCounter.showCounter) {
    return <TimerCountDown orderId={showCounter.orderId} setCounter={setShowCounter} />
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <NavbarX />

      {/* Main Content with padding for sticky navbar */}
      <div className="pt-[70px]">
        {/* Map Section */}
        <div className="w-full bg-white shadow-md">
          <CurrentLocationMap
            center={{ lat, lng }}
            drivers={drivers}
            selectedDriver={selectedDriver}
            selectedDriverLocation={selectedDriverLocation}
            locdriver={locdriver}
            drivermarkers={drivermarkers}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Location Info Banner */}
          {lat && lng && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Navigation className="w-5 h-5" />
                <p className="text-sm md:text-base font-medium">
                  Searching within 5km radius of your location
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Driver List - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Available Drivers
                </h2>

                {drivers.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {drivers.map((d) => {
                      const driverLat = d?.location?.coordinates?.[1]
                      const driverLng = d?.location?.coordinates?.[0]
                      const dis = calculateDistance(lat, lng, driverLat, driverLng)
                      const isSelected = selectedDriver === d._id

                      return (
                        <button
                          key={d._id}
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
                          className={`w-full text-left bg-white rounded-xl border-2 p-4 hover:shadow-lg transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={d.profileimg ? `https://project-uber.onrender.com${d.profileimg}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                              alt="Driver"
                              className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{d.name}</h3>
                                {isSelected && (
                                  <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  📞 {d.number}
                                </span>
                                <span className="flex items-center gap-1">
                                  🚘 {d.cartype || "Unknown"}
                                </span>
                                <span className="flex items-center gap-1">
                                  🔢 {d.carnumber}
                                </span>
                                <span className="flex items-center gap-1">
                                  💰 ₹{d.distancerate}/km
                                </span>
                                {dis && (
                                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                                    📍 {dis} km away
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No drivers found within 5 km radius</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your pickup location</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
                  <h2 className="text-2xl font-bold">Book Your Ride</h2>
                  <p className="text-gray-300 text-sm mt-1">Fill in the details below</p>
                </div>

                <form onSubmit={handleBookRide} className="p-6 space-y-4">
                  {/* From */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      From
                    </label>
                    <input
                      type="text"
                      value={pickup}
                      readOnly
                      className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>

                  {/* To */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      To
                    </label>
                    <input
                      type="text"
                      value={dropoff}
                      readOnly
                      className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 text-sm"
                    />
                  </div>

                  {/* Driver & Distance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Driver
                      </label>
                      <input
                        type="text"
                        value={selectedDriverName || "Not selected"}
                        readOnly
                        className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 text-sm"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Navigation className="w-4 h-4" />
                        Distance
                      </label>
                      <div className="border-2 border-gray-200 rounded-lg p-3 bg-white text-gray-700 text-sm font-medium">
                        {distance ? `${distance} km` : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Time & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4" />
                        Time
                      </label>
                      <DatePicker
                        selected={time}
                        onChange={(t) => setTime(t)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Select time"
                        className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </label>
                      <DatePicker
                        selected={date}
                        onChange={(t) => setDate(t)}
                        minDate={new Date()}
                        dateFormat="yyyy/MM/dd"
                        placeholderText="Select date"
                        className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-700 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Price Estimate */}
                  {selectedDriver && distance && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-green-800 font-semibold">
                          <DollarSign className="w-5 h-5" />
                          Estimated Fare
                        </span>
                        <span className="text-2xl font-bold text-green-700">
                          ₹{(distance * (drivers.find(d => d._id === selectedDriver)?.distancerate || 10)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!selectedDriver || !time || !date}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-md ${selectedDriver && time && date
                        ? 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Book Ride Now
                  </button>

                  {/* Info */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By booking, you agree to our terms and conditions
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookRide