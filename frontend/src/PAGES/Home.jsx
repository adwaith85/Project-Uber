import React from 'react'
import Navbar from '../Components/Navbar'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import Userhomemap from '../Components/Userhomemap'

function Home() {
  return (<>
    <Navbar />

    {/* Hero Section */}
    <div className="px-8 py-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 md:text-4xl">Go anywhere with Uber</h1>
        <p className="text-xl text-gray-600 max-w-2xl md:text-lg">
          Request a ride, hop in, and go. Choose from multiple ride options to fit your needs and budget.
        </p>
      </div>
    </div>

    {/* Location and Map Section */}
    <div className="flex flex-col lg:flex-row bg-gray-50">
      <div className="flex-1 p-4">
        <div className="max-w-sm">
          <h2 className="text-2xl font-semibold mb-6 md:ml-7">Request a ride now</h2>
          <Location />

          <div className="mt-6 flex flex-wrap items-center gap-2 md:ml-4">
            <Link
              to="/BookRide"
              className='bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-all shadow-md'
            >
              See Prices
            </Link>
            <Link
              to={'/Login'}
              className='text-gray-700 hover:text-black underline underline-offset-4 transition-colors'
            >
              Log in to see your recent activity
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fast pickup</h3>
                <p className="text-gray-600">Get matched with a nearby driver in minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Upfront pricing</h3>
                <p className="text-gray-600">Know exactly what you'll pay before you book</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Safe and reliable</h3>
                <p className="text-gray-600">24/7 support and safety features for peace of mind</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] md:mr-8">
        <Userhomemap />
      </div>
    </div>

    {/* Ride Options */}
    <Suggestions />

    {/* Account Section */}
    <div className="bg-white py-16 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">
          Your journey, personalized
        </h2>

        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Log in to access your ride history, saved places, payment methods, and personalized recommendations.
          Track your trips, manage your account, and get support whenever you need it.
        </p>

        <div className="flex items-center justify-center gap-6 flex-wrap">
          <Link
            to={'/Login'}
            className='bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all shadow-lg'
          >
            Log in to your account
          </Link>
          <button className="text-black text-lg font-semibold border-b-2 border-gray-400 hover:border-black transition-all pb-1">
            Create an account
          </button>
        </div>

        {/* Benefits List */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Trip History</h3>
            <p className="text-gray-600">View all your past rides and receipts in one place</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Saved Places</h3>
            <p className="text-gray-600">Quick access to your favorite destinations</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
            <p className="text-gray-600">Get help whenever you need it, day or night</p>
          </div>
        </div>
      </div>
    </div>

    {/* Decorative Image Section */}
    <div className="py-12 px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center">
          <img
            src="https://tb-static.uber.com/prod/udam-assets/850e6b6d-a29e-4960-bcab-46de99547d24.svg"
            alt="Uber service illustration"
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>

    {/* Plan for Later Section */}
    <div className='py-16 px-8 bg-white'>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3">Plan your ride in advance</h2>
          <p className="text-lg text-gray-600">
            Schedule a ride up to 90 days ahead, so you can book and forget it
          </p>
        </div>

        {/* Reserve Card */}
        <div className="bg-[#b7d8de] p-8 rounded-2xl shadow-lg max-w-2xl">
          <h3 className="text-3xl font-bold mb-3">
            Get your ride right with Uber Reserve
          </h3>
          <p className="text-gray-700 mb-8 text-lg">
            Reserve your ride in advance for extra peace of mind. Perfect for airport trips, important meetings, or any time you need guaranteed pickup.
          </p>

          <h4 className="text-lg font-semibold mb-3">Choose date and time</h4>

          {/* Input Fields */}
          <div className="flex gap-4 mb-8 flex-wrap">
            {/* Date */}
            <div className="flex-1 min-w-[200px]">
              <label className='block text-sm font-medium text-gray-700 mb-2'>Date</label>
              <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <span className="mr-3 text-xl">📅</span>
                <input
                  type="date"
                  className="w-full outline-none bg-transparent text-black"
                />
              </div>
            </div>

            {/* Time */}
            <div className="flex-1 min-w-[200px]">
              <label className='block text-sm font-medium text-gray-700 mb-2'>Time</label>
              <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <span className="mr-3 text-xl">🕒</span>
                <select
                  name="Time"
                  className="w-full outline-none bg-transparent text-black"
                  defaultValue=""
                >
                  <option value="" disabled>Select time</option>
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
          </div>

          {/* Button */}
          <button
            className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md text-lg">
            Reserve your ride
          </button>

          <p className="text-sm text-gray-600 mt-4">
            * Reservation fee may apply. You'll see the total price before confirming.
          </p>
        </div>
      </div>
    </div>

  </>)
}

export default Home