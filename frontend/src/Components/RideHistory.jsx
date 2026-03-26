import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../Api/Axiosclient';
import UserStore from '../Store/UserStore';
import { Clock, MapPin, Calendar, DollarSign, Navigation, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

function RideHistory() {
    const token = UserStore((state) => state.token);

    const { data: rides, isLoading, error } = useQuery({
        queryKey: ['rideHistory'],
        queryFn: async () => {
            const res = await api.get('/history', {
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
                <p className="text-gray-600">Loading your journey history...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error loading ride history. Please try again later.</p>
        </div>
    );

    if (!rides || rides.length === 0) return (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No rides yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Your past trips will appear here. Ready to take your first ride?
            </p>
            <button 
                onClick={() => window.location.href = '/UserHome'}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg"
            >
                Book a Ride
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Your Activity</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {rides.length} {rides.length === 1 ? 'Ride' : 'Rides'}
                </span>
            </div>

            <div className="grid gap-6">
                {rides.map((ride) => (
                    <div 
                        key={ride._id} 
                        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
                    >
                        <div className="p-6">
                            {/* Header: Date & Status */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <Calendar className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {new Date(ride.date).toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {ride.time}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 
                                    ${ride.status === 'completed' 
                                        ? 'bg-green-50 text-green-700 border border-green-100' 
                                        : ride.status === 'cancelled'
                                        ? 'bg-red-50 text-red-700 border border-red-100'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}
                                >
                                    {ride.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                    {ride.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                                    {ride.status}
                                </span>
                            </div>

                            {/* Trip Path */}
                            <div className="relative pl-8 mb-6">
                                {/* Connector Line */}
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100 border-l-2 border-dashed"></div>
                                
                                <div className="mb-4 relative">
                                    <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-white border-2 border-green-500 z-10"></div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tight mb-0.5">Pickup</p>
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{ride.pickup}</p>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-white border-2 border-red-500 z-10"></div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tight mb-0.5">Drop-off</p>
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{ride.dropoff}</p>
                                </div>
                            </div>

                            {/* Footer: Price & Distance */}
                            <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Fare</span>
                                        <span className="text-xl font-black text-gray-900">₹{(ride.price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="h-8 w-px bg-gray-100"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Distance</span>
                                        <span className="text-sm font-bold text-gray-700">{(ride.distance || 0).toFixed(1)} km</span>
                                    </div>
                                </div>
                                <button className="p-2 bg-gray-50 hover:bg-black hover:text-white rounded-lg transition-all text-gray-400">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RideHistory;
