import React, { useEffect, useState } from 'react';
import api from '../Api/Axiosclient';
import UserStore from '../Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, DollarSign, Navigation } from 'lucide-react';

const RideHistory = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = UserStore((state) => state.token);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await api.get('/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRides(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch ride history');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchRides();
        } else {
            setLoading(false);
            setError('Please login to view history');
        }
    }, [token]);

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors mr-4"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Your Ride History
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {rides.length === 0 && !error ? (
                    <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                        <Navigation className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400">No rides yet</h3>
                        <p className="text-gray-500 mt-2">Book your first ride to see it here!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rides.map((ride) => (
                            <div
                                key={ride._id}
                                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 group"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-yellow-500/20 transition-colors">
                                            <Calendar className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Date</p>
                                            <p className="font-medium">{new Date(ride.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-yellow-500/20 transition-colors">
                                            <Clock className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Time</p>
                                            <p className="font-medium">{ride.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                                            ${ride.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                ride.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}
                                        >
                                            {ride.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative pl-8 border-l-2 border-gray-800 space-y-6 my-6">
                                    <div className="relative">
                                        <div className="absolute -left-[39px] top-0 p-1 bg-gray-900 rounded-full border-2 border-green-500">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Pickup</p>
                                        <p className="text-lg font-medium">{ride.pickup}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[39px] top-0 p-1 bg-gray-900 rounded-full border-2 border-red-500">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Dropoff</p>
                                        <p className="text-lg font-medium">{ride.dropoff}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-400" />
                                        <span className="text-2xl font-bold text-green-400">
                                            ${ride.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {ride.distance.toFixed(1)} km
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideHistory;
