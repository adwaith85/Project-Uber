import React from 'react'
import { Link } from "react-router-dom"
function Navbar() {
  return (<>
    <div className='p-[10px] w-[100%] h-[60px] bg-black flex justify-between items-center'>
      <h2 className='p-[10px] text-3xl pr-3xl text-amber-50'>Uber</h2>
      <div className="p-[60px] flex items-center gap-[10px]">

        <Link to={'/Login'} className=' text-right text-white'>log in</Link>
        {/* <button className=' text-right text-white'>Log in</button> */}
        <button className='border rounded-4xl p-2 bg-white text-right text-black'>Sign up</button>
      </div>

    </div>

  </>

  )
}

export default Navbar