import React, { useState } from 'react'
import { Link } from "react-router-dom"
import Profiledropdown from './Profiledropdown'
import { IoCloseSharp } from "react-icons/io5"

function NavbarX({ onScrollToSection }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <nav className='fixed top-0 left-0 right-0 w-full h-[70px] bg-white shadow-md flex justify-between items-center px-6 z-50 border-b border-gray-200'>
                {/* Left Section - Logo and Nav Links */}
                <div className='flex items-center gap-8'>
                    <Link to="/UserHome" className='text-3xl text-black font-bold hover:text-gray-700 transition-colors'>
                        Uber
                    </Link>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center gap-6'>
                        <a href='' onClick={() => onScrollToSection("ride")} className='text-base font-medium text-gray-700 hover:text-black transition-colors'>
                            Ride
                        </a>
                        <a href="" onClick={() => onScrollToSection("drive")} className='text-base font-medium text-gray-700 hover:text-black transition-colors'>
                            Drive
                        </a>
                        <a href="" onClick={() => onScrollToSection("about")} className='text-base font-medium text-gray-700 hover:text-black transition-colors'>
                            About
                        </a>
                    </div>
                </div>

                {/* Right Section - Profile and Menu */}
                <div className="flex items-center gap-4">
                    {/* Desktop Profile Dropdown */}
                    <div className="hidden md:block">
                        <Profiledropdown />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className='flex flex-col justify-center items-center gap-1.5 cursor-pointer p-2 md:hidden hover:bg-gray-100 rounded-lg transition'
                        aria-label="Open menu"
                    >
                        <span className='w-6 h-0.5 bg-black rounded'></span>
                        <span className='w-5 h-0.5 bg-black rounded'></span>
                        <span className='w-6 h-0.5 bg-black rounded'></span>
                    </button>
                </div>

                {/* Mobile Sidebar Menu */}
                <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                    <div className='flex flex-col h-full'>
                        {/* Close Button */}
                        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
                            <h3 className='text-xl font-bold'>Menu</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className='p-2 hover:bg-gray-100 rounded-lg transition'
                                aria-label="Close menu"
                            >
                                <IoCloseSharp className='text-2xl' />
                            </button>
                        </div>

                        {/* Mobile Profile Section - At Top */}
                        <div className='p-6 border-b border-gray-200'>
                            <Profiledropdown isMobile={true} onClose={() => setIsOpen(false)} />
                        </div>

                        {/* Mobile Navigation Links */}
                        {/* <div className='flex flex-col p-6 gap-4'>
                           <a 
                           href="#"
                                onClick={() => setIsOpen(false)}
                                className='text-lg font-medium text-gray-700 hover:text-black py-3 px-4 hover:bg-gray-50 rounded-lg transition'
                            >
                                Ride
                            </a>
                            <a
                             href="#"
                                onClick={() => setIsOpen(false)}
                                className='text-lg font-medium text-gray-700 hover:text-black py-3 px-4 hover:bg-gray-50 rounded-lg transition'
                            >
                                Drive
                            </a>
                            <a
                                href="#"
                                onClick={() => setIsOpen(false)}
                                className='text-lg font-medium text-gray-700 hover:text-black py-3 px-4 hover:bg-gray-50 rounded-lg transition'
                            >
                                About
                            </a>
                        </div> */}
                    </div>
                </div>

                {/* Overlay */}
                {isOpen && (
                    <div
                        onClick={() => setIsOpen(false)}
                        className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
                    />
                )}
            </nav>
        </>
    )
}

export default NavbarX