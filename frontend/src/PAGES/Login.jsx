import React from 'react'
import Navbar from '../Components/Navbar'
import { Link } from "react-router-dom"

function Login() {
  return (<>

    <div className="w-[100%] h-screen flex flex-col  items-center">
      {/* Uber Header */}
      <div className="w-full bg-black py-3  px-6">
        <h1 className="text-white p-1 ml-17 text-2xl font-medium">Uber</h1>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md px-6 mt-4 -ml-4">
        <h2 className="text-xl  mb-6">
          What's your phone number or email?
        </h2>

        {/* Input */}
        <div className="flex w-[100%]  border-none h-12 items-center bg-gray-200 rounded-lg px-4 py-3 -mt-3 mb-4 border border-gray-300">
          <input
            type="text"
            placeholder="Enter phone number or email"
            className="flex-1   bg-transparent outline-none text-gray-700 placeholder-gray-500"
          />
         
          <span className="text-gray-400">🔒</span>
        </div>
        <div className="flex w-[100%]  border-none h-12 items-center bg-gray-200 rounded-lg px-4 py-3 -mt-3 mb-4 border border-gray-300">
          <input
            type="text"
            placeholder="Enter password"
            className="flex-1   bg-transparent outline-none text-gray-700 placeholder-gray-500"
          />
      
          <span className="text-gray-400">🔒</span>
        </div>


    
        <Link to="/UserHome">
        <button className="w-[100%]  bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition mb-5">
          Continue
        </button></Link>

        {/* Divider */}
        <div className="flex w-[100%] items-center mb-3">
          <div className="flex-1  h-px bg-gray-950"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-950"></div>
        </div>

        {/* Google Button */}
        <button className="w-[100%] border-none h-12  flex items-center justify-center gap-2 bg-gray-200 py-3 rounded-lg font-medium mb-2 border border-gray-300 hover:bg-gray-200">
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Apple Button */}
        <button className="w-[100%] border-none  h-12 flex items-center justify-center gap-2 bg-gray-200 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-200">
          <img
            src="https://www.svgrepo.com/show/349442/apple.svg"
            alt="Apple"
            className="w-5 h-5"
          />
          Continue with Apple
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-800 mt-9">
          By continuing, you agree to calls, including by autodialer, WhatsApp,
          or texts from Uber and its affiliates.
        </p>
      </div>
    </div>
  </>)
}

export default Login