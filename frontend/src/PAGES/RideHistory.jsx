import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../Api/Axiosclient';
import UserStore from '../Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, DollarSign, Navigation, CheckCircle, XCircle } from 'lucide-react';
import NavbarX from '../Components/NavbarX';
import Footer from '../Components/Footer';

const RideHistory = () => {
    const token = UserStore((state) => state.token);
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading your journey history...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarX />
            
            <div className="pt-[100px] pb-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-black"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ride History</h1>
                            <p className="text-gray-500 font-medium">Review your past trips and details</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl mb-8 flex items-center gap-3">
                            <XCircle className="w-6 h-6" />
                            <p className="font-semibold">Failed to load history. Please try again.</p>
                        </div>
                    )}

                    {(!rides || rides.length === 0) && !error ? (
                        <div className="bg-white rounded-3xl shadow-sm p-16 text-center border border-gray-100">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Navigation className="w-12 h-12 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No rides booked yet</h3>
                            <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg">
                                When you start taking rides, your complete journey history will appear here.
                            </p>
                            <button 
                                onClick={() => navigate('/UserHome')}
                                className="bg-black text-white px-10 py-4 rounded-full font-black hover:bg-gray-800 transition-all shadow-xl hover:scale-105"
                            >
                                Start Your First Trip
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {rides.map((ride) => (
                                <div 
                                    key={ride._id} 
                                    className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden group"
                                >
                                    <div className="p-8">
                                        {/* Status & Date */}
                                        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black transition-colors duration-500">
                                                    <Calendar className="w-7 h-7 text-gray-400 group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">
                                                        {new Date(ride.date).toLocaleDateString('en-US', { 
                                                            weekday: 'long',
                                                            month: 'long', 
                                                            day: 'numeric', 
                                                            year: 'numeric' 
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                        <Clock className="w-4 h-4" /> {ride.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2
                                                ${ride.status === 'completed' 
                                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                                    : ride.status === 'cancelled'
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}
                                            >
                                                {ride.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                                                {ride.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                                                {ride.status}
                                            </div>
                                        </div>

                                        {/* Trip Path */}
                                        <div className="relative pl-12 mb-10">
                                            <div className="absolute left-[1.15rem] top-3 bottom-3 w-[2px] bg-gray-100 border-l-2 border-dashed"></div>
                                            
                                            <div className="mb-8 relative">
                                                <div className="absolute -left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-[3px] border-green-500 shadow-sm z-10"></div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5">Pickup Location</p>
                                                <p className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">{ride.pickup}</p>
                                            </div>
                                            
                                            <div className="relative">
                                                <div className="absolute -left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-[3px] border-red-500 shadow-sm z-10"></div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5">Drop-off Destination</p>
                                                <p className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">{ride.dropoff}</p>
                                            </div>
                                        </div>

                                        {/* Financials & Distance */}
                                        <div className="flex items-center justify-between pt-8 border-t-2 border-gray-50">
                                            <div className="flex items-center gap-8">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">Total Fare</span>
                                                    <span className="text-3xl font-black text-gray-900 italic">₹{(ride.price || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="h-10 w-[2px] bg-gray-100"></div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 block">Distance</span>
                                                    <span className="text-lg font-black text-gray-700">{(ride.distance ||0).toFixed(1)} <span className="text-gray-400 text-sm">km</span></span>
                                                </div>
                                            </div>
                                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-black text-gray-600 hover:text-white font-black rounded-2xl transition-all duration-300">
                                                <span className="text-xs uppercase tracking-widest">Details</span>
                                                <Navigation className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RideHistory;
