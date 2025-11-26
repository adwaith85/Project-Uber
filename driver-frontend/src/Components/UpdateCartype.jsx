import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import DriverStore from "../Store/DriverStore"
import api from '../api/axiosClient'
import { useNavigate } from 'react-router-dom'

function UpdateCartype() {
    const [firstname, setFirstName] = useState("")
    const [lastname, setLastName] = useState("")
    const { token } = DriverStore()

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleUpdate = async () => {
        if (!firstname.trim() && !lastname.trim()) {
            setMessage({ type: 'error', text: 'Please enter at least one field' })
            return
        }
        setLoading(true)
        try {
            const cartype = `${firstname} ${lastname}`.trim()
            await api.post('/UpdateDriver', { cartype }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setMessage({ type: 'success', text: 'Car type updated successfully!' })
            setTimeout(() => navigate('/Profile'), 1500)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update car type' })
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white text-black">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="pt-8 px-4">
                    <Link to="/Profile" className="text-gray-600 hover:text-black transition text-sm font-semibold">
                        ← Back to Profile
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex justify-center items-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-800/20 rounded-lg">
                                    <Car className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-black">Update Car Type</h2>
                                    <p className="text-gray-100 text-sm">Change your car details</p>
                                </div>
                            </div>

                            {/* Car Name */}
                            <div className="mb-4">
                                <label className="block font-semibold mb-2 text-gray-200">Car Name/Brand</label>
                                <input
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="e.g., Toyota, Honda"
                                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-purple-500/50 focus:bg-gray-600/50 transition"
                                />
                            </div>

                            {/* Car Model */}
                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-gray-200">Car Model</label>
                                <input
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="e.g., Fortuner, Civic"
                                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-purple-500/50 focus:bg-gray-600/50 transition"
                                />
                            </div>

                            {/* Update Button */}
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-900 to-black text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-white transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Car Type'
                                )}
                            </button>

                            {/* Message */}
                            {message && (
                                <div className={`mt-4 p-3 rounded-lg text-center font-medium ${message.type === 'success'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateCartype