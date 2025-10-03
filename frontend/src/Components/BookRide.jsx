import React from 'react'
import Navbar from './Navbar'
import Location from './Location'

function BookRide() {
  return (<>
    <Navbar />
    <div className='w-100% h-109 bg-gray-500'>

    </div>
    <div className='border-white rounded-2xl'>
      <h2 className='px-[28px] py-[14px] font-bold text-xl'>Get a ride</h2>
      <Location />
      <div className="flex gap-2 p-4 -ml-2">
        <button className='border-none rounded-3xl bg-gray-200  text-sm text-gray ml-5  h-10 w-30'>Pickup now</button>
        <button className='border-none rounded-3xl bg-gray-200  text-sm text-gray ml-5  h-10 w-30'>For me</button>
      </div>
    </div>
  </>
  )
}

export default BookRide