import React from 'react'
import { Link } from "react-router-dom"
function NavbarX() {
    return (
    <>
        <div className='border-b-1 p-[10px] w-[100%] h-[60px] bg-white flex justify-between items-center'>
            
            <div className='flex gap-5 mt-2 p-2 -ml-15'>
                <h2 className='ml-15 mb-3 text-2xl text-black font-medium'>Uber</h2>
                <h3 className='text-lg mt-1 hover:font-medium'>Ride</h3>
                <h3 className='text-lg mt-1 hover:font-medium'>Drive</h3>
                <h3 className='text-lg mt-1 hover:font-medium'>About</h3>
            </div>
            <div className=" flex items-center gap-[20px]">
                <button className='border rounded-3xl bg-black text-md text-white ml-5 h-10 w-30'>Sign up</button>
                <div className='flex flex-col justify-center items-center gap-1 cursor-pointer pl-2'>
                    <span className='w-[20px] h-[2px] bg-black'></span>
                    <span className='w-[16px] h-[2px] bg-black'></span>
                    <span className='w-[20px] h-[2px] bg-black'></span>
                </div>
            </div>
        </div>
    </>
    )
}
export default NavbarX