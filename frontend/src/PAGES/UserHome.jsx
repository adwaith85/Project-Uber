import NavbarX from '../Components/NavbarX'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import CurrentLocationMap from '../Components/CurrentLocationMap'
import { useEffect, useState } from 'react'
import L from "leaflet"

function UserHome() {
  const [pickupLocation, setPickupLocation] = useState(null)
  const [dropoffLocation, setDropoffLocation] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [route, setRoute] = useState([])
  const [distance, setDistance] = useState(null)

  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0
    const toRad = (deg) => (deg * Math.PI) / 180
    const R = 6371
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lng - coord1.lng)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(2)
  }

  const showRoute = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert("Please select both pickup and dropoff locations")
      return
    }
    try {
      const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2OTg1ZDk4ZjVkNTQxMWU5OTAzZjVmMGNjMjZlYWIxIiwiaCI6Im11cm11cjY0In0="
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${pickupLocation.lng},${pickupLocation.lat}&end=${dropoffLocation.lng},${dropoffLocation.lat}`
      const res = await fetch(url)
      const data = await res.json()
      const coords = data.features[0].geometry.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0]
      }))
      setRoute(coords)
      setDistance(calculateDistance(pickupLocation, dropoffLocation))
    } catch (err) {
      console.error(err)
      alert("Failed to fetch route. Please try again.")
    }
  }

  return (
    <>
      <div>
        <div className="relative z-10">
          <NavbarX />
        </div>

        <div className="p-5 m-2 -mt-3 h-1/4 bg-white">
          <h1 className="text-[2rem] font-semibold">Get ready for your first trip 😊</h1>
          <p className="mt-4 text-sm -mb-4">
            Discover the convenience of requesting a ride now, or schedule one for later directly from your browser.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 p-4">

          <div className="w-full lg:w-1/3 flex flex-col items-start md:items-start">
            <Location
              onPickupSelect={(loc) => setPickupLocation(loc)}
              onDropoffSelect={(loc) => setDropoffLocation(loc)}
            />

            <div className="flex flex-row gap-3 mt-4 ml-4 ">
              <button
                onClick={showRoute}
                className="border rounded-xl p-3 bg-black text-md text-white w-36 hover:bg-gray-800 transition"
              >
                Show Route
              </button>

              <Link to="/BookRide">
                <button className="border rounded-xl p-3 bg-gray-700 text-md text-white w-36 hover:bg-gray-600 transition">
                  Book Ride
                </button>
              </Link>
            </div>

            {distance && (
              <div className="mt-3 ml-6 text-lg font-semibold text-gray-800">
                Distance: {distance} km
              </div>
            )}
          </div>

          <div className="w-full lg:w-2/3 h-80 lg:h-[400px] md:w-[50%] md:-mt-[16px]">
            <CurrentLocationMap
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              currentLocation={currentLocation}
              route={route}
            />
          </div>
        </div>

        <div className='mt-3 mb-2'>
          <Suggestions />
        </div>
      </div>
    </>
  )
}

export default UserHome













// import NavbarX from '../Components/NavbarX'
// import Location from '../Components/Location'
// import { Link } from "react-router-dom"
// import Suggestions from '../Components/Suggestions'
// import CurrentLocationMap from '../Components/CurrentLocationMap'
// import { useMutation } from "@tanstack/react-query"
// import UserStore from '../Store/UserStore'
// import api from '../Api/Axiosclient'
// import { useEffect } from 'react'

// function UserHome() {
//   const token = UserStore((state) => state.token)

//   // Mutation to update location
//   const locationMutation = useMutation({
//     mutationFn: async (formdata) => {
//       return await api.put("/locationupdate", formdata, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//     },
//     onSuccess: () => {
//       console.log("Location updated successfully")
//     },
//     onError: (error) => {
//       console.error("Error updating location:", error.message)
//     },
//   })

//   // Auto-update location every 10 seconds
//   const updateLocation = () => {
//     if (!navigator.geolocation) {
//       console.warn("Geolocation not supported by your browser")
//       return
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const location = {
//           type: "Point",
//           coordinates: [position.coords.longitude, position.coords.latitude],
//         }
//         locationMutation.mutate({ location })
//       },
//       (error) => {
//         console.error("Failed to get location:", error)
//       }
//     )
//   }

//   useEffect(() => {
//     const interval = setInterval(() => {
//       updateLocation()
//     }, 10000)
//     return () => clearInterval(interval)
//   }, [])

//   // ✅ Removed Google Maps loader logic completely

//   return (
//     <>
//       <div>
//         <div className='relative z-10'>
//           <NavbarX />
//         </div>

//         {/* Section - Ride Intro */}
//         <div className="p-5 m-2 -mt-3 h-1/4 bg-white">
//           <h1 className="text-[2rem] font-semibold">Get ready for your first trip 😊</h1>
//           <p className='-mb-4 mt-4 text-sm'>
//             Discover the convenience of requesting a ride now, or schedule one for later directly from your browser.
//           </p>
//         </div>

//         {/* Pickup & Dropoff Inputs */}
//         <Location />

//         {/* See Prices Button */}
//         <Link to="/BookRide">
//           <button className='border rounded-xl p-3 bg-black text-md text-white ml-6 mt-3 h-12 w-36'>
//             See Prices
//           </button>
//         </Link>

//         {/* ✅ Leaflet Map Component */}
//         <div className="">
//           <CurrentLocationMap />
//         </div>

//         {/* Suggestions */}
//         <div>
//           <Suggestions />
//         </div>
//       </div>
//     </>
//   )
// }

// export default UserHome
