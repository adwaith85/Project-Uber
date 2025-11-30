import NavbarX from '../Components/NavbarX'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import Footer from '../Components/Footer'

import { useEffect, useRef, useState } from 'react'
import L from "leaflet"
import Userhomemap from '../Components/Userhomemap'

function UserHome() {
  const [pickupLocation, setPickupLocation] = useState(null)
  const [dropoffLocation, setDropoffLocation] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [route, setRoute] = useState([])
  const [distance, setDistance] = useState(null)

  const pickuplocationnameref = useRef("")
  const dropofflocationnameref = useRef("")

  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0
    const toRad = (deg) => (deg * Math.PI) / 180
    const R = 6371
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lng - coord1.lng)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) ** 2
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

  const sectionRefs = {
    ride: useRef(null),
    drive: useRef(null),
    about: useRef(null),
  };
  const scrollToSection = (key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <NavbarX onScrollToSection={scrollToSection} />

      {/* Main content with padding for sticky navbar */}
      <div className="pt-[70px]">

        {/* Hero Section */}
        <div ref={sectionRefs.drive} className="bg-gradient-to-r from-gray-50 to-white px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get ready for your first trip 😊</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Discover the convenience of requesting a ride now, or schedule one for later directly from your browser.
            </p>
          </div>
        </div>

        {/* Ride Booking Section */}
        <div className="bg-white py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-10">
              {/* Location Input Section */}
              <div className="w-full lg:w-2/5 flex flex-col">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6">Plan your ride</h2>

                  <Location
                    pickuplocationnameref={pickuplocationnameref}
                    dropofflocationnameref={dropofflocationnameref}
                    onPickupSelect={(loc) => setPickupLocation(loc)}
                    onDropoffSelect={(loc) => setDropoffLocation(loc)}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={showRoute}
                      className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md"
                    >
                      Show Route
                    </button>

                    <Link
                      to={`/BookRide?lat=${pickupLocation?.lat || ""}&lng=${pickupLocation?.lng || ""}&dropLat=${dropoffLocation?.lat || ""}&dropLng=${dropoffLocation?.lng || ""}&dis=${distance || ""}&drop=${dropofflocationnameref.current.value || ""}&pickup=${pickuplocationnameref.current.value}`}
                      className="flex-1"
                    >
                      <button className="w-full bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all shadow-md">
                        Book Ride
                      </button>
                    </Link>
                  </div>

                  {distance && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Estimated Distance:</span>
                        <span className="text-2xl font-bold text-black">{distance} km</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Tips */}
                <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Quick Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Enter your pickup and destination to see available rides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>View route on map before booking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Compare prices and choose the best option for you</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Map Section */}
              <div className="w-full lg:w-3/5">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-[420px]">
                  <Userhomemap
                    pickupLocation={pickupLocation}
                    dropoffLocation={dropoffLocation}
                    currentLocation={currentLocation}
                    route={route}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div ref={sectionRefs.ride} className="bg-gray-50 py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Your ride, your way</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🚗</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Multiple ride options</h3>
                <p className="text-gray-600">
                  Choose from economy to premium rides based on your budget and preferences.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time tracking</h3>
                <p className="text-gray-600">
                  Track your driver's location in real-time and get accurate arrival estimates.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Rated drivers</h3>
                <p className="text-gray-600">
                  All our drivers are verified, rated, and committed to your safety and comfort.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ride Options */}
        <div className="bg-white py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Explore ride options</h2>
            <Suggestions />
          </div>
        </div>

        {/* Safety Section */}
        <div className="bg-gray-50 py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Your safety is our priority</h2>
                <p className="text-lg text-gray-600 mb-8">
                  We're committed to making every ride safe and secure with advanced safety features and 24/7 support.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Emergency assistance</h3>
                      <p className="text-gray-600">Quick access to emergency services directly from the app</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Share trip details</h3>
                      <p className="text-gray-600">Let friends and family track your ride in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Driver verification</h3>
                      <p className="text-gray-600">All drivers undergo thorough background checks</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <img
                  src="https://tb-static.uber.com/prod/udam-assets/850e6b6d-a29e-4960-bcab-46de99547d24.svg"
                  alt="Safety illustration"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer ref={sectionRefs.about} />
    </>
  )
}

export default UserHome