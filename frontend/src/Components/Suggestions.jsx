import React from 'react'
import { Link } from "react-router-dom"
function Suggestions() {
  return (
    <>
     <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Suggestions</h2>

      <div className="flex flex-col gap-6">

        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Ride</h4>
            <p className="text-gray-700 text-[13px] mb-4">Go anywhere with Uber. Request a ride, hop in, and go.</p>
            <Link to="/BookRide" className='bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black'>Details</Link>
            {/* <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button> */}
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDOb9UfTmRb_7N70tjlP_aHR75pZNMk-S6zQ&s" alt="" className="w-28  md:w-32" />
          </div>
        </div>


        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Reserve</h4>
            <p className="text-gray-700 text-[13px] mb-4">Reserve your ride in advance so you can relax on the day of your trip.</p>
            <Link to="/BookRide" className='bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black'>Details</Link>
            {/* <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button> */}
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz0F1sb1B9Wka-3vPtjLGY0mgurj25OZ2iZQ&s" alt="" className="w-28  md:w-32" />
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Intercity</h4>
            <p className="text-gray-700 text-[13px] mb-4">Get convenient, affordable outstation cabs anytime at your door.</p>
            <Link to="/BookRide" className='bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black'>Details</Link>
            {/* <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button> */}
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJCh_Wvpa8MlqQFLiiAVuHZM7VnHhdXTMdUg&s" alt="" className="w-28 md:w-32" />
          </div>
        </div>
        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Rentals</h4>
            <p className="text-gray-700 text-[13px] mb-4">Request a trip for a block of time and make multiple stops.</p>
            <Link to="/BookRide" className='bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black'>Details</Link>
            {/* <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button> */}
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8UvILwn5zKTncD56waPTACFufw9d_BRNqTw&s" alt="" className="w-28 md:w-32" />
          </div>
        </div>
      </div>
    </div>

    </>
  )
}

export default Suggestions