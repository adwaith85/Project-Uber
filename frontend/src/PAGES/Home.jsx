import React from 'react'
import Navbar from '../Components/Navbar'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'

function Home() {
  return (<>
    <Navbar />
    <div className="p-5  h-1/4 bg-white flex items-center ">
            <h1 className=" m-3 text-[2.4rem] font-semibold md:-mb-2 md:text-[2rem]">Go anywhere with Uber</h1>
        </div>
    <Location />
    <div className="p-5 -ml-4 flex flex-wrap">
                <Link to="/BookRide" className='border rounded-lg p-3 bg-black text-md text-white ml-5  md:text-[14px]'>See Prices</Link>
                {/* <button className='border rounded-xl bg-black text-m text-white ml-5  h-12 w-36'>See prices</button> */}
                <Link to={'/Login'} className='ml-10 underline underline-offset-8 md:ml-3 md:text-[15px]'>log in to see your recent activity</Link>
                {/* <button className='ml-10 underline underline-offset-8'>log in to see your recent activity</button> */}
            </div>
   <Suggestions/>
    <div className="w-[100%] mx-auto text-center py-12 ">

      <h2 className="text-[25px] -ml-10 font-bold mb-4">
        Log in to see your account details
      </h2>


      <p className="text-md ml-[19px] m-7 mt-3  text-gray-600 mb-8">
        View past trips, tailored suggestions, support resources, and more.
      </p>


      <div className="-ml-14 flex items-center justify-center gap-6">
        <Link to={'/Login'} className='bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition'>Log in to your account</Link>
        {/* <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition">
          Log in to your account
        </button> */}
        <button className="text-black text-lg font-medium border-b border-gray-400 hover:border-black transition">
          Create an account
        </button>
      </div>
    </div>
    

    <div className="p-6 md:ml-60">
      <div className="flex items-center justify-center md:w-[70%] md:justify-center">
      <img
        src="https://tb-static.uber.com/prod/udam-assets/850e6b6d-a29e-4960-bcab-46de99547d24.svg"
        alt="example"
        className="w-200 p-5 -mt-5"
      />
    </div>
    </div>
    <div className='m-4 md:m-3'>
      {/* Heading */}
      <h2 className="text-[27px] font-bold mb-4">Plan for later</h2>

      {/* Card */}
      <div className="bg-[#b7d8de] p-6 rounded-xl shadow-md md:w-[40%]">
        <h2 className="text-[30px] font-bold pt-6 pb-5 mb-4">
          Get your ride right with Uber Reserve
        </h2>

        <h4 className="text-base text-[18px] font-medium -mt-1 mb-4">Choose date and time</h4>
        <div className='flex gap-37 -mt-2'>
          <h6 className='text-gray-500'>Date</h6>
          <h6 className='text-gray-500 '>Time</h6>
        </div>

        {/* Input Fields */}
        <div className="flex gap-1.5 mb-6">

          {/* Date */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 w-44">
            <span className="mr-2">📅</span>

            <input
              type="date"
              placeholder='Date'
              className="w-[50%] outline-none bg-transparent text-black"
            />
          </div>

          {/* Time */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 w-44">
            <span className="mr-2">🕒</span>
            <select
              name="Time"
              className="w-full outline-none bg-transparent text-black"
              defaultValue=""
            >
              <option value="" disabled>
                Time
              </option>
              <option value="10:00PM">10:00 PM</option>
              <option value="10:15PM">10:15 PM</option>
              <option value="10:30PM">10:30 PM</option>
              <option value="10:45PM">10:45 PM</option>
              <option value="11:00PM">11:00 PM</option>
              <option value="11:15PM">11:15 PM</option>
              <option value="11:30PM">11:30 PM</option>
              <option value="11:45PM">11:45 PM</option>
            </select>
          </div>
        </div>

        {/* Button */}
        <button className="w-[90%] bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition">
          Next
        </button>
      </div>
    </div>

  </>)
}

export default Home