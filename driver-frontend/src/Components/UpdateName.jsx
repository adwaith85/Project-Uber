import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import DriverStore from "../Store/DriverStore"
import api from '../api/axiosClient'
import { useNavigate } from 'react-router-dom'

function UpdateName() {
    const [firstname, setFirstName] = useState("")
    const [lastname, setLastName] = useState("")
    const { token } = DriverStore()
    const UpdateData = async () => {
        try {
            const name = `${firstname} ${lastname}`.trim()
            const response = await api.post(
                '/UpdateDriver',
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.log(error)
        }
    }

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleUpdate = async () => {
        if (!firstname.trim() && !lastname.trim()) {
            setMessage({ type: 'error', text: 'Please enter at least one name field' })
            return
        }
        setLoading(true)
        try {
            const name = `${firstname} ${lastname}`.trim()
            await api.post('/UpdateDriver', { name }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setMessage({ type: 'success', text: 'Name updated successfully!' })
            setTimeout(() => navigate('/Profile'), 1500)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update name' })
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="pt-8 px-4">
                    <Link to="/Profile" className="text-orange-400 hover:text-orange-300 transition text-sm font-semibold">
                        ← Back to Profile
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex justify-center items-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-500/20 rounded-lg">
                                    <User className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Update Name</h2>
                                    <p className="text-gray-400 text-sm">Change how others see your name</p>
                                </div>
                            </div>

                            {/* First Name */}
                            <div className="mb-4">
                                <label className="block font-semibold mb-2 text-gray-300">First Name</label>
                                <input
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter your first name"
                                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/50 transition"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-gray-300">Last Name</label>
                                <input
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter your last name"
                                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/50 transition"
                                />
                            </div>

                            {/* Update Button */}
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Name'
                                )}
                            </button>

                            {/* Message */}
                            {message && (
                                <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                                    message.type === 'success'
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

export default UpdateName