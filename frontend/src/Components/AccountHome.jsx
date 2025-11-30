import React from 'react';
import { FaUser } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
import { MdPayment, MdHistory, MdSettings } from "react-icons/md";
import { useQuery } from '@tanstack/react-query';
import api from '../Api/Axiosclient';
import UserStore from '../Store/UserStore';

function AccountHome() {
    const token = UserStore((state) => state.token);

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
        <div className="w-full">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100 mb-4">
                        <img
                            src={data?.profileimg || "https://via.placeholder.com/80"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {data?.name ?? "Not found"}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {data?.email ?? "Not found"}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                            ✓ Verified
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                            {data?.number ?? "No phone"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Personal info</h3>
                            <p className="text-sm text-gray-600">Manage your details</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <GrShieldSecurity className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Security</h3>
                            <p className="text-sm text-gray-600">Password & 2FA</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <RiGitRepositoryPrivateFill className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Privacy</h3>
                            <p className="text-sm text-gray-600">Data & permissions</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <MdPayment className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Payment</h3>
                            <p className="text-sm text-gray-600">Cards & wallets</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <MdHistory className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Ride history</h3>
                            <p className="text-sm text-gray-600">View past trips</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <MdSettings className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Settings</h3>
                            <p className="text-sm text-gray-600">App preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Stats */}
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-md p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Account Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Total Rides</p>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Member Since</p>
                        <p className="text-xl font-semibold">2025</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Saved Places</p>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Rating</p>
                        <p className="text-3xl font-bold">⭐ 5.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountHome;