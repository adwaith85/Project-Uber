import React, { useState } from 'react'
import { Link } from "react-router-dom"
import Profiledropdown from './Profiledropdown'
import { IoCloseSharp } from "react-icons/io5";
function NavbarX() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <div className='border-b-1 p-[10px] w-[100%] h-[60px] bg-white flex justify-between items-center'>
                <div className='flex gap-5 mt-2 p-2 -ml-15'>
                    <button>
                        <Link to="/UserHome" className='ml-15 mb-3 text-2xl text-black font-medium'>Uber</Link>
                    </button>
                    {/* <h2 className='ml-15 mb-3 text-2xl text-black font-medium'>Uber</h2> */}
                    <div className={`fixed flex flex-col items-center  bg-white gap-5 top-0 right-0 w-[100%] h-[45vh] z-10 md:h-auto md:w-auto md:flex-row md:gap-8 md:relative ${isOpen ? " -translate-x-0" : "-translate-x-full md:-translate-x-0"}`}>
                        <div className='w-full flex justify-end p-[20px]  '>
                            <IoCloseSharp onClick={() => setIsOpen(false)} className=' text-2xl md:hidden ' />
                        </div>
                        <Link to="/BookRide" className='text-lg mt-1 hover:font-medium'>Ride</Link>
                        {/* <h3 className='text-lg mt-1 hover:font-medium'>Ride</h3> */}
                        <h3 className='text-lg mt-1 hover:font-medium'>Drive</h3>
                        <h3 className='text-lg mt-1 hover:font-medium'>About</h3>
                    </div>
                </div>
                {/* <div className=" flex items-center gap-[20px]"> */}
                <div className="w-[30%] flex justify-end items-center">
                    {/* Profile Dropdown */}
                    <div className="flex items-center gap-3">
                        <Profiledropdown />
                    </div>
                    {/* Hamburger button (only mobile) */}
                    <div
                        onClick={() => setIsOpen(true)}
                        className="flex flex-col justify-center items-center gap-[5px] pr-4 pl-3 cursor-pointer md:hidden"
                    ></div>
                    {/* <button className='border rounded-3xl bg-black text-md text-white ml-5 h-10 w-30'>Sign up</button> */}
                    <div onClick={() => setIsOpen(true)} className='flex flex-col justify-center items-center gap-1 cursor-pointer pl-2 md:hidden'>
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