import React from 'react'
import AllRideDetails from "../Components/AllRideDetails"
import Navbar from '../Components/Navbar'

function TripsPage() {
  return (
    <div className="">
        <div className="">
        <Navbar/>
    </div>
    <div className='w-full h-full'>

        <AllRideDetails className="w-full"/>
    </div>
    </div>
  )
}

export default TripsPage