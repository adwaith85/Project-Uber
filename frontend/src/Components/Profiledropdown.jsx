import React from 'react'
import { useState } from "react";
import { Link } from "react-router-dom"
import { ChevronDown, User, HelpCircle, Wallet, BookOpen, Settings, Car, Truck } from "lucide-react";
import { Navigate, useNavigate } from 'react-router-dom';

function Profiledropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const Navigate = useNavigate()
    return (
        <div className="relative inline-block text-left">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full"
            >
                <span>....</span>
                <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border p-4 z-50">
                    {/* User Info */}
                    <div className="flex justify-between items-center border-b pb-3 mb-3">
                        <div>
                            <h3 className="font-bold text-lg">adwaith</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                        </div>
                    </div>

                    {/* Top Buttons */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
                            <HelpCircle className="w-6 h-6 mb-1" />
                            <span className="text-sm">Help</span>
                        </button>
                        <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
                            <Wallet className="w-6 h-6 mb-1" />
                            <span className="text-sm">Wallet</span>
                        </button>
                        <button className="flex flex-col items-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
                            <BookOpen className="w-6 h-6 mb-1" />
                            <span className="text-sm">Activity</span>
                        </button>
                    </div>

                    {/* List Items */}
                    <div className="flex flex-col space-y-3">
                        <button onClick={() => Navigate("/AccountManager")} className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg">
                            <User className="w-5 h-5" />
                            <span>Manage account</span>
                        </button>
                        <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg">
                            <Car className="w-5 h-5" />
                            <span>Ride</span>
                        </button>
                        <button className="flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-lg">
                            <Truck className="w-5 h-5" />
                            <span>Drive & deliver</span>
                        </button>
                        <button className="w-full h-[3rem] text-red-500 bg-gray-100 rounded-lg ">
                            <Link to="/">Sign out</Link>
                             </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profiledropdown