import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, User, Phone, Mail, Globe, Camera } from 'lucide-react';
import api from '../Api/Axiosclient';
import UserStore from '../Store/UserStore';

function PersonalInfo() {
    const navigate = useNavigate();
    const token = UserStore((state) => state.token);

    // Fetch user details
    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await api.get('/GetDetails', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data;
        },
        enabled: !!token,
    });

    if (isLoading) return (
        <div className="flex justify-center items-center py-20">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error loading data</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                    <p className="text-gray-300 mt-1">Manage your personal details and preferences</p>
                </div>

                <div className="p-6">
                    {/* Profile Picture */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100">
                                    <img
                                        src={data?.profileimg || "https://via.placeholder.com/80"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <Link
                                    to="/ProfileUpdate"
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-lg"
                                >
                                    <Camera className="w-4 h-4 text-white" />
                                </Link>
                            </div>
                            <div>
                                <Link
                                    to="/ProfileUpdate"
                                    className="inline-block px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                                >
                                    Change Photo
                                </Link>
                                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name
                        </label>
                        <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                            <p className="text-lg font-medium">{data?.name ?? "Not set"}</p>
                            <Link to="/UpdateForm" className="text-gray-400 group-hover:text-black transition">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number
                        </label>
                        <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium">{data?.number ?? "Not set"}</p>
                                {data?.number ? (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                        Unverified
                                    </span>
                                ) : null}
                            </div>
                            <Link to="/UpdateNumber" className="text-gray-400 group-hover:text-black transition">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address
                        </label>
                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-medium">{data?.email ?? "Not set"}</p>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    ✓ Verified
                                </span>
                            </div>
                            <span className="text-gray-300">
                                <ChevronRight className="w-5 h-5" />
                            </span>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Globe className="w-4 h-4 inline mr-2" />
                            Language
                        </label>
                        <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                            <p className="text-lg font-medium text-gray-600">Update device language</p>
                            <span className="text-gray-400 group-hover:text-black transition">
                                <ChevronRight className="w-5 h-5" />
                            </span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Your personal information is kept secure and private. We'll never share it without your permission.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalInfo;
