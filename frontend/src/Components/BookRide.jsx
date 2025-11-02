import React, { useState, useEffect } from 'react'
import CurrentLocationMap from './CurrentLocationMap'
import { useLocation } from "react-router-dom"
import NavbarX from "./NavbarX"

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
  const pickup = params.get("pickup") || "Not selected"
  const dropoff = params.get("dropoff") || "Not selected"

  const [selectedDriver, setSelectedDriver] = useState(null)
  const [selectedDriverName, setSelectedDriverName] = useState("")
  const [selectedDriverLocation, setSelectedDriverLocation] = useState(null)
  const [pickupTime, setPickupTime] = useState("")

  // Fetch nearby drivers
  useEffect(() => {
    if (lat && lng) {
      fetch(`http://localhost:8080/nearby?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(data => setDrivers(data.drivers || []))
        .catch(err => console.error("Error fetching drivers:", err))
    }
  }, [lat, lng])

  // Handle selecting driver
  const handleSelectDriver = async (driverId) => {
    try {
      const res = await fetch(`http://localhost:8080/UpdateLocation/${driverId}`)
      const data = await res.json()
      if (data?.location?.coordinates) {
        const [driverLng, driverLat] = data.location.coordinates
        setSelectedDriver(driverId)
        setSelectedDriverName(data?.name || "Unknown Driver")
        setSelectedDriverLocation({ lat: driverLat, lng: driverLng })
      }
    } catch (error) {
      console.error("Error fetching driver location:", error)
    }
  }

  const handleBookRide = (e) => {
    e.preventDefault()
    if (!pickupTime || !selectedDriverName) {
      alert("Please select a driver and pickup time.")
      return
    }
    alert(`Ride booked with ${selectedDriverName} at ${pickupTime}!`)
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
        />
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
                  className={`flex justify-between items-center bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow ${selectedDriver === d._id ? 'ring-2 ring-blue-500' : ''
                    }`}
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
      <div className='border-white rounded-2xl'>
        <h2 className='px-[28px] py-[14px] font-bold text-xl md:ml-10'>Get a ride</h2>

        {/* 🧾 Ride Details Form */}
        <div className="bg-white mx-6 md:mx-10 mb-6 p-6 rounded-2xl shadow-lg">
          <form onSubmit={handleBookRide} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <label className="block text-gray-600 text-sm font-medium">From</label>
                <input
                  type="text"
                  value={pickup}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700"
                />
              </div>

              <div className="flex-1">
                <label className="block text-gray-600 text-sm font-medium">To</label>
                <input
                  type="text"
                  value={dropoff}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700"
                />
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

            <div className=" grid grid-cols-2 md:grid-cols-2 gap-4 w-full mt-4">
              {/* Pickup Time */}
              <div className="flex flex-col">
                <label className="block text-gray-600 text-sm font-medium mb-1">
                  Pickup Time
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Distance to travel */}
              <div className="flex flex-col">
                <label className="block text-gray-600 text-sm font-medium mb-1">
                  Distance to Travel
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 text-gray-700 bg-white">
                  <span className="flex-1"> km` : "-- km"</span>
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
  )
}

export default BookRide















// import React, { useState, useEffect, useRef } from 'react'
// import Navbar from './Navbar'
// import CurrentLocationMap from './CurrentLocationMap'
// import { useLocation } from "react-router-dom"

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   if (!lat1 || !lon1 || !lat2 || !lon2) return null
//   const R = 6371 
//   const dLat = (lat2 - lat1) * Math.PI / 180
//   const dLon = (lon2 - lon1) * Math.PI / 180
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * Math.PI / 180) *
//     Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) *
//     Math.sin(dLon / 2)
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//   return (R * c).toFixed(2)
// }

// function BookRide() {
//   const [drivers, setDrivers] = useState([])
//   const location = useLocation()
//   const params = new URLSearchParams(location.search)
//   const lat = parseFloat(params.get("lat"))
//   const lng = parseFloat(params.get("lng"))
//   const [currentLocation, setCurrentLocation] = useState(null)
//   const [selectedDriver, setSelectedDriver] = useState(null)
  

//   // Fetch nearby drivers
//   useEffect(() => {
//     if (lat && lng) {
//       fetch(`http://localhost:8080/nearby?lat=${lat}&lng=${lng}`)
//         .then(res => res.json())
//         .then(data => setDrivers(data.drivers || []))
//         .catch(err => console.error("Error fetching drivers:", err))
//     }
//   }, [lat, lng])

//   // Handle selecting driver — show only that driver’s location
//   const handleSelectDriver = async (driverId) => {
//     try {
//       const res = await fetch(`http://localhost:8080/driverlocation/${driverId}`)
//       const data = await res.json()
//       if (data?.location?.coordinates) {
//         const [driverLng, driverLat] = data.location.coordinates
//         setSelectedDriver(data)
//         setCurrentLocation({ lat: driverLat, lng: driverLng }) // Show only chosen driver on map
//       }
//     } catch (error) {
//       console.error("Error fetching driver location:", error)
//     }
//   }


//   return (
//     <>
//       <Navbar />

//       {/* Map Section */}
//       <div className="w-full bg-gray-50">
//         {/* Only show selected driver location */}
//         <CurrentLocationMap currentLocation={currentLocation} />
//       </div>

//       {/* Driver Cards Section */}
//       <div className="w-full p-4">
//         {lat && lng && (
//           <p className="text-gray-700 mb-4 text-sm md:text-base text-center">
//             Uber found within 5km radius of <strong>latitude:</strong> {lat}, <strong>longitude:</strong> {lng}
//           </p>
//         )}

//         {drivers.length > 0 ? (
//           <div className="flex flex-col gap-4">
//             {drivers.map((d) => {
//               const driverLat = d?.location?.coordinates?.[1]
//               const driverLng = d?.location?.coordinates?.[0]
//               const distance = calculateDistance(lat, lng, driverLat, driverLng)

//               return (
//                 <div
//                   key={d._id}
//                   className="flex justify-between items-center bg-white rounded-2xl shadow p-4 hover:shadow-lg transition-shadow"
//                 >
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={d.profileimg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
//                       alt="Driver"
//                       className="w-14 h-14 rounded-full border"
//                     />
//                     <div className="flex flex-row flex-wrap gap-6 text-gray-700 text-sm">
//                       <span><strong>Name:</strong> {d.name}</span>
//                       <span><strong>📞</strong> {d.number}</span>
//                       <span><strong>🚘</strong> {d.cartype || "Unknown"}</span>
//                       <span><strong>🔢</strong> {d.carnumber}</span>
//                       {distance && <span><strong>📍</strong> {distance} km away</span>}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handleSelectDriver(d._id)}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
//                   >
//                     Add
//                   </button>
//                 </div>
//               )
//             })}
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center">No drivers found within 5 km radius.</p>
//         )}
//       </div>

//       {/* Buttons Section */}
//       <div className='border-white rounded-2xl'>
//         <h2 className='px-[28px] py-[14px] font-bold text-xl md:ml-10'>Get a ride</h2>

//         <div className="flex gap-2 p-4 -ml-2 md:ml-5">
//           {/* Hidden time input */}
//           <input
            
//             className="hidden"
//           />

//           {/* Pickup now button shows selected time */}
//           <button
            
//             className='border-none rounded-3xl bg-gray-200 text-sm text-gray ml-5 h-10 w-30'
//           >pickup now
          
//           </button>

//           {/* Book ride button */}
//           <button
           
//             className='border-none rounded-3xl bg-gray-200 text-sm text-gray ml-5 h-10 w-30'
//           >
//             Book Ride
//           </button>
//         </div>
//       </div>
//     </>
//   )
// }

// export default BookRide
