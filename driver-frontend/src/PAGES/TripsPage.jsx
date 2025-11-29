import React from 'react'
import AllRideDetails from "../Components/AllRideDetails"
import Navbar from '../Components/Navbar'
import { Link } from 'react-router-dom'

function TripsPage() {
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>

      <div className='w-full h-full'>
        <AllRideDetails className="w-full" enableSorting={true} />
      </div>

      <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
        <div className="w-full  mx-auto px-7 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-wide">
              Rider
            </h2>
            <p className="mt-3 text-gray-400">
              Making your travel smooth, easy and comfortable.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link to="/home" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/tripspage" className="hover:text-white transition">My Trips</Link></li>
              <li><Link to="/support" className="hover:text-white transition">Support</Link></li>
              <li><Link to="" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: uber@rider.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: Kannur,India</li>
            </ul>
          </div>
        </div>
        {/* Bottom */}
        <div className="border-t border-gray-700 mt-10 pt-2 text-center text-gray-500">
          © {new Date().getFullYear()} Rider. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default TripsPage