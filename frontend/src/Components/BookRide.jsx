import React from 'react'
import Navbar from './Navbar'
import CurrentLocationMap from './CurrentLocationMap'
import { useState } from 'react'
import { useLocation } from "react-router-dom"
import { useEffect } from 'react'
import Location from './Location'

function BookRide() {

  const [drivers, setDrivers] = useState([])
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const lat = params.get("lat")
  const lng = params.get("lng")


  useEffect(() => {
    if (lat && lng) {
      fetch(`http://localhost:8080/nearby?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(data => setDrivers(data.drivers || []))
        .catch(err => console.error("Error fetching drivers:", err))
    }
  }, [lat, lng])

   const [currentLocation, setCurrentLocation] = useState(null)
   
  return (<>
    <Navbar />
    <div className='w-100% h-100 bg-gray-50 m-2'>
    <CurrentLocationMap
    currentLocation={currentLocation}
    />
    </div>
{drivers.length > 0 ? (
        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d._id} className="border p-3 rounded-lg">
              <p><strong>{d.name}</strong></p>
              <p>CarNumber: {d.carnumber}</p>
              <p>Phone: {d.number}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No drivers found within 5 km radius.</p>
      )}

      {/* <div className="p-5">
      <h1 className="text-2xl font-semibold mb-4">Book Your Ride</h1>
      {lat && lng ? (
        <>
          <p><strong>Pickup Latitude:</strong> {lat}</p>
          <p><strong>Pickup Longitude:</strong> {lng}</p>
        </>
      ) : (
        <p>No pickup location provided.</p>
      )}
    </div> */}
    <div className='border-white rounded-2xl'>
      <h2 className='px-[28px] py-[14px] font-bold text-xl md:ml-10'>Get a ride</h2>
      <Location />
      <div className="flex gap-2 p-4 -ml-2 md:ml-5">
        <button className='border-none rounded-3xl bg-gray-200  text-sm text-gray ml-5  h-10 w-30'>Pickup now</button>
        <button className='border-none rounded-3xl bg-gray-200  text-sm text-gray ml-5  h-10 w-30'>For me</button>
      </div>
    </div>
  </>
  )
}

export default BookRide