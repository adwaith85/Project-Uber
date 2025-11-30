import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Check } from 'lucide-react'
import api from "../Api/Axiosclient"
import UserStore from '../Store/UserStore'
import NavbarX from './NavbarX'
import Footer from './Footer'

function UpdateForm() {
    const [firstname, setFirstName] = useState("")
    const [lastname, setLastName] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateStatus, setUpdateStatus] = useState("")
    const { token } = UserStore()
    const navigate = useNavigate()

    const UpdateData = async () => {
        if (!firstname.trim()) {
            setUpdateStatus("Please enter your first name");
            return;
        }

        try {
            setIsUpdating(true);
            setUpdateStatus("Updating...");

            const name = `${firstname} ${lastname}`.trim()
            const response = await api.post(
                '/updateuser',
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUpdateStatus("Name updated successfully!");

            setTimeout(() => {
                navigate("/AccountManager");
            }, 1500);
        } catch (error) {
            console.log(error)
            setUpdateStatus("Update failed. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <>
            <NavbarX />

            <div className="min-h-screen bg-gray-50 pt-[70px]">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    {/* Back Button */}
                    <Link
                        to="/AccountManager"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Account</span>
                    </Link>

                    {/* Main Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
                            <div className="flex items-center gap-3">
                                <User className="w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">Update Your Name</h2>
                                    <p className="text-gray-300 mt-1">Change how others see your name</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <p className="text-gray-600 mb-8">
                                This is the name you would like other people to use when referring to you.
                                Make sure it matches your official documents if required.
                            </p>

                            {/* First Name */}
                            <div className="mb-6">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter your first name"
                                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="mb-8">
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Last Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter your last name"
                                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition"
                                />
                            </div>

                            {/* Status Message */}
                            {updateStatus && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${updateStatus.includes("success")
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : updateStatus.includes("failed") || updateStatus.includes("Please")
                                            ? "bg-red-50 text-red-700 border border-red-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}>
                                    {updateStatus.includes("success") && <Check className="w-5 h-5" />}
                                    <p className="font-medium">{updateStatus}</p>
                                </div>
                            )}

                            {/* Update Button */}
                            <button
                                className={`w-full py-4 rounded-lg font-semibold transition shadow-md ${!firstname.trim() || isUpdating
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-black text-white hover:bg-gray-800"
                                    }`}
                                onClick={UpdateData}
                                disabled={!firstname.trim() || isUpdating}
                            >
                                {isUpdating ? "Updating..." : "Update Name"}
                            </button>

                            {/* Info Box */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Your name will be visible to drivers and other users during rides.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}

export default UpdateForm