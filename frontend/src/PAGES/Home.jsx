import React from 'react'
import Navbar from '../Components/Navbar'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

function Home() {
  return (<>
    <Navbar />
    
    {/* Hero Section with Gradient Background */}
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "4s"}}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Content */}
        <div className="px-4 md:px-8 pt-8 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400">
              Go anywhere with Uber
            </h1>
            <p className="text-xl text-gray-300 mb-8">Request a ride, enjoy the journey.</p>
          </div>

          {/* Location Component */}
          <div className="mb-8">
            <Location />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Link 
              to="/BookRide" 
              className='inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105'
            >
              See Prices
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to={'/Login'} 
              className='inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition font-semibold underline underline-offset-4'
            >
              Log in to see your recent activity
            </Link>
          </div>

          {/* Suggestions */}
          <div className="mb-16">
            <Suggestions />
          </div>

          {/* Account Section */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gray-700/50 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Log in to see your account details
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              View past trips, tailored suggestions, support resources, and more.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <Link 
                to={'/Login'} 
                className='bg-gradient-to-r from-orange-400 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105'
              >
                Log in to your account
              </Link>
              <Link 
                to={'/Register'}
                className="text-orange-400 hover:text-orange-300 text-lg font-semibold border-b-2 border-orange-400 hover:border-orange-300 transition pb-1"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center mb-12">
            <img
              src="https://tb-static.uber.com/prod/udam-assets/850e6b6d-a29e-4960-bcab-46de99547d24.svg"
              alt="Uber illustration"
              className="w-full max-w-2xl opacity-90 hover:opacity-100 transition"
            />
          </div>

          {/* Plan for Later Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Plan for later</h2>

            <div className="bg-gradient-to-br from-orange-600/30 to-orange-700/30 backdrop-blur-sm p-8 rounded-2xl border border-orange-500/50 md:max-w-md">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Get your ride right with Uber Reserve
              </h3>
              <p className="text-gray-200 mb-6">Schedule your ride in advance</p>

              <div className="space-y-4 mb-6">
                {/* Date Input */}
                <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 focus-within:border-orange-500/50 transition">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <input
                    type="date"
                    className="w-full outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>

                {/* Time Input */}
                <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 focus-within:border-orange-500/50 transition">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <select className="w-full outline-none bg-transparent text-white" defaultValue="">
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

              {/* Button */}
              <button className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </>)
}

export default Home