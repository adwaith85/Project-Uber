import React, { useState, useEffect, useRef } from 'react'
import CurrentLocationMap from './CurrentLocationMap'
import { useLocation } from "react-router-dom"
import NavbarX from "./NavbarX"
import TimerCountDown from './Timer'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"

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

  const [showCounter,SetCounter]=useState(false)
  

  const [selectedDriver, setSelectedDriver] = useState(null)
  const [selectedDriverName, setSelectedDriverName] = useState("")
  const [selectedDriverLocation, setSelectedDriverLocation] = useState(null)
  const [pickupTime, setPickupTime] = useState("")
  const [locdriver, setLocdriver] = useState(null)

  // store markers by driverId
  const drivermarkers = useRef({})
  const [time,setTime]=useState("")

  // Fetch nearby drivers
  useEffect(() => {
    if (lat && lng) {
      fetch(`http://localhost:8080/nearby?lat=${lat}&lng=${lng}&dis=${distance}` )
        .then(res => res.json())
        .then(data => setDrivers(data.drivers || []))
        .catch(err => console.error("Error fetching drivers:", err))
    }
  }, [lat, lng])

  // Handle selecting driver
  // const handleSelectDriver = async (driverId) => {
  //   try {
  //     const res = await fetch(`http://localhost:8080/UpdateLocation/${driverId}`)
  //     const data = await res.json()
  //     if (data?.location?.coordinates) {
  //       const [driverLng, driverLat] = data.location.coordinates
  //       setSelectedDriver(driverId)
  //       setSelectedDriverName(data?.name || "Unknown Driver")
  //       setSelectedDriverLocation({ lat: driverLat, lng: driverLng })
  //     }
  //   } catch (error) {
  //     console.error("Error fetching driver location:", error)
  //   }
  // }

  const handleBookRide = (e) => {
    e.preventDefault()
    if (!time || !selectedDriverName) {
      alert("Please select a driver and pickup time.")
      return
    }
    alert(`Ride booked with ${selectedDriverName} at ${time}!`)
    SetCounter(true)
  }

  return (
    <>
      <NavbarX />

      {/* Map Section */}
      <div className="w-full bg-gray-50">
        <CurrentLocationMap
          center={{ lat, lng }}
          drivers={drivers}
          selectedDriver={selectedDriver}
          selectedDriverLocation={selectedDriverLocation}
          locdriver={locdriver}
          drivermarkers={drivermarkers}
        />
      </div>

      {/* Driver Cards */}
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
              const dis = calculateDistance(lat, lng, driverLat, driverLng)

              return (
                <div
                  key={d._id}
                  className={`flex justify-between items-center bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow ${selectedDriver === d._id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-4">
                   {
                    d.profileimg?<>
                     <img
                      src={`http://localhost:8080${d.profileimg}`}
                      alt="Driver"
                      className="w-14 h-14 rounded-full border"
                    />
                    </>:<>
                  
                    <img
                      src={"https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt="Driver"
                      className="w-14 h-14 rounded-full border"
                    />
                    </>
                   }
                    <div className="flex flex-row flex-wrap gap-6 text-gray-700 text-sm">
                      <span><strong>Name:</strong> {d.name}</span>
                      <span><strong>📞</strong> {d.number}</span>
                      <span><strong>🚘</strong> {d.cartype || "Unknown"}</span>
                      <span><strong>🔢</strong> {d.carnumber}</span>
                      {dis && <span><strong>📍</strong> {dis} km away</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        setSelectedDriverName(d.name)
                      // handleSelectDriver(d._id)
                      setLocdriver(d.location.coordinates)

                      // open popup for this driver
                      const marker = drivermarkers.current[d._id]
                      if (marker) marker.openPopup()
                    }}
              
                    className={`px-4 py-2 rounded-lg transition-all ${selectedDriver === d._id
                        ? 'bg-blue-600 text-white scale-105'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
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

      {/* Ride Booking Section */}
    {
      showCounter?<>
      
      <TimerCountDown/>
      
      
      </>:<>
      
        <div className='border-white rounded-2xl'>
        <h2 className='px-[28px] py-[14px] font-bold text-xl md:ml-10'>Get a ride</h2>

        <div className="bg-white mx-6 md:mx-10 mb-6 p-6 rounded-2xl shadow-lg">
          <form 
          onSubmit={handleBookRide} 
          // onClick={()=>SetCounter(true)} 
          className="flex flex-col gap-4">
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

            <div>
              <label className="block text-gray-600 text-sm font-medium">Driver</label>
              <input
                type="text"
                value={selectedDriverName || "No driver selected"}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full mt-4">
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
                minTime={new Date()} // ✅ locks out earlier times today
                maxTime={new Date(new Date().setHours(23, 59, 59, 999))} // ✅ end of the day
              />
                {/* <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                /> */}
              </div>

              <div className="flex flex-col">
                <label className="block text-gray-600 text-sm font-medium mb-1">Distance to Travel</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 text-gray-700 bg-white">
                  <span className="flex-1">{distance || "not found"}</span>
                </div>
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
      
      
      </>
    }
    </>
  )
}

export default BookRide
