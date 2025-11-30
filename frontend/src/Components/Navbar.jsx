import React from 'react'
import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className='fixed top-0 left-0 right-0 w-full h-[70px] bg-black flex justify-between items-center px-8 shadow-lg z-50'>
      <Link to="/" className='text-3xl font-bold text-white hover:text-gray-300 transition-colors'>
        Uber
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to={'/Login'}
          className='text-white font-medium hover:text-gray-300 transition-colors px-4 py-2'
        >
          Log in
        </Link>
        <Link
          to={'/Register'}
          className='bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all shadow-md'
        >
          Sign up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar