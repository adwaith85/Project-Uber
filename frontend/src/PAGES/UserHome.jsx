import NavbarX from '../Components/NavbarX'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import CurrentLocationMap from '../Components/CurrentLocationMap'
import { useMutation } from "@tanstack/react-query"
import UserStore from '../Store/UserStore'
import api from '../Api/Axiosclient'
import { useEffect, useState } from 'react'

function UserHome() {
  const token = UserStore((state) => state.token)
  const [pickupLocation, setPickupLocation] = useState(null)
  const [dropoffLocation, setDropoffLocation] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)

  // Mutation to update location
  const locationMutation = useMutation({
    mutationFn: async (locationData) => {
      return await api.put("/locationupdate", JSON.stringify({ location: locationData }), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    },
    onSuccess: () => console.log("Location updated successfully"),
    onError: (error) => console.error("Error updating location:", error.response?.data || error.message),
  })

  // Function to get current location and send to backend
  const updateLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(loc)

        const locationData = {
          type: "Point",
          coordinates: [loc.lng, loc.lat], // make sure backend expects [lng, lat]
        }

        locationMutation.mutate(locationData)
      },
      (error) => {
        console.error("Failed to get location:", error)
      }
    )
  }

  // Auto-update location every 10 seconds
  useEffect(() => {
    if (!token) {
      console.warn("No token found! User may not be logged in.")
      return
    }

    updateLocation()
    const interval = setInterval(updateLocation, 10000)
    return () => clearInterval(interval)
  }, [token]) // re-run if token changes

  return (
    <>
      <div>
        <div className='relative z-10'>
          <NavbarX />
        </div>

        <div className="p-5 m-2 -mt-3 h-1/4 bg-white">
          <h1 className="text-[2rem] font-semibold">Get ready to your first trip😊</h1>
          <p className='-mb-4 mt-4 text-sm'>
            Discover the convenience of requesting a ride now, or schedule one for later directly from your browser.
          </p>
        </div>

        <Location
          onPickupSelect={(loc) => setPickupLocation(loc)}
          onDropoffSelect={(loc) => setDropoffLocation(loc)}
        />

        <Link to="/BookRide">
          <button className='border rounded-xl p-3 bg-black text-md text-white ml-6 mt-3 h-12 w-36'>
            See Prices
          </button>
        </Link>

        <div className="">
          <CurrentLocationMap
            pickupLocation={pickupLocation}
            dropoffLocation={dropoffLocation}
            currentLocation={currentLocation}
          />
        </div>

        <div>
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
