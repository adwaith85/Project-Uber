import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DriverStore from "../Store/DriverStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const driverId = DriverStore((state) => state.user?._id);
  const navigate = useNavigate();

  // Memoized fetch function for real-time updates
  const fetchEarnings = useCallback(async () => {
    if (!driverId) return;
    try {
      const res = await fetch(`http://localhost:8080/driver-earnings/${driverId}`);
      if (!res.ok) throw new Error("Failed to fetch earnings");
      const data = await res.json();
      setEarnings(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    }
  }, [driverId]);

  // Initial load
  useEffect(() => {
    if (!driverId) {
      setError("Driver ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchEarnings().then(() => setLoading(false));
  }, [driverId, fetchEarnings]);

  // Real-time polling for updates every 30 seconds when page is active
  useEffect(() => {
    if (!autoRefresh || !driverId) return;

    const pollInterval = setInterval(() => {
      fetchEarnings();
    }, 30000); // 30 second refresh

    return () => clearInterval(pollInterval);
  }, [autoRefresh, driverId, fetchEarnings]);

  // Handle page visibility to pause polling when not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setAutoRefresh(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center border border-gray-700/50">
          <div className="text-yellow-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-6 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const dailyChartData = earnings?.completedRides?.slice(-7).map((ride) => ({
    date: new Date(ride.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    earnings: parseFloat(ride.price),
  })) || [];

  const monthlyChartData = earnings?.completedRides?.reduce((acc, ride) => {
    const monthYear = new Date(ride.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const existing = acc.find((item) => item.month === monthYear);
    if (existing) {
      existing.earnings += parseFloat(ride.price);
    } else {
      acc.push({ month: monthYear, earnings: parseFloat(ride.price) });
    }
    return acc;
  }, []) || [];

  const ridesStats = [
    {
      name: "This Month", value: earnings?.completedRides?.filter((r) => {
        const month = new Date(r.date).toISOString().slice(0, 7);
        const currentMonth = new Date().toISOString().slice(0, 7);
        return month === currentMonth;
      }).length || 0, color: "#3b82f6"
    },
    {
      name: "This Year", value: earnings?.completedRides?.filter((r) => {
        const year = new Date(r.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return year === currentYear;
      }).length || 0, color: "#10b981"
    },
    { name: "Total", value: earnings?.completedRides?.length || 0, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {/* Header with Refresh Button */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-2">💰 Earnings Dashboard</h1>
            <p className="text-sm md:text-base text-gray-300">Track your daily, monthly, and annual earnings</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchEarnings()}
              className="flex-1 sm:flex-auto bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-2 px-4 md:px-6 rounded-lg transition text-sm md:text-base shadow-lg"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex-1 sm:flex-auto font-semibold py-2 px-3 md:px-4 rounded-lg transition text-sm md:text-base ${autoRefresh
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300"
                }`}
            >
              {autoRefresh ? "📡 Auto" : "⏸ Auto"}
            </button>
          </div>
        </div>

        {/* Last Refresh Time */}
        <div className="mb-6 text-xs md:text-sm text-gray-300">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Key Metrics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-700/50 hover:border-orange-500/30 transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wide">Total Earnings</p>
                <h3 className="text-2xl md:text-4xl font-bold text-white mt-2">
                  ₹{parseFloat(earnings?.totalEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="text-3xl md:text-4xl">📊</div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-700/40">
              <p className="text-xs text-gray-400">{earnings?.completedRides?.length || 0} completed rides</p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-700/50 hover:border-blue-500/30 transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wide">This Month</p>
                <h3 className="text-2xl md:text-4xl font-bold text-white mt-2">
                  ₹{parseFloat(earnings?.monthEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="text-3xl md:text-4xl">📅</div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-700/40">
              <p className="text-xs text-gray-400">
                {earnings?.completedRides?.filter((r) => {
                  const month = new Date(r.date).toISOString().slice(0, 7);
                  const currentMonth = new Date().toISOString().slice(0, 7);
                  return month === currentMonth;
                }).length || 0} rides this month
              </p>
            </div>
          </div>

          {/* Today */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-700/50 hover:border-green-500/30 transition sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wide">Today</p>
                <h3 className="text-2xl md:text-4xl font-bold text-white mt-2">
                  ₹{parseFloat(earnings?.todayEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="text-3xl md:text-4xl">📱</div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-700/40">
              <p className="text-xs text-gray-400">
                {earnings?.completedRides?.filter((r) => {
                  const today = new Date().toISOString().slice(0, 10);
                  return new Date(r.date).toISOString().slice(0, 10) === today;
                }).length || 0} rides today
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section - Full Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Daily Earnings Chart */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-700/50">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center">
              <span className="text-2xl mr-2">📈</span> <span className="line-clamp-1">Daily Earnings (Last 7 Days)</span>
            </h2>
            {earnings && dailyChartData.length > 0 ? (
              <div className="w-full h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyChartData}
                    margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      cursor={{ fill: "rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="earnings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 md:h-80 flex items-center justify-center text-gray-500">
                No earnings data available
              </div>
            )}
          </div>

          {/* Monthly Earnings Chart */}
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-700/50">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center">
              <span className="text-2xl mr-2">📊</span> <span className="line-clamp-1">Monthly Earnings Trend</span>
            </h2>
            {earnings && monthlyChartData.length > 0 ? (
              <div className="w-full h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyChartData}
                    margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "0.75rem" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 md:h-80 flex items-center justify-center text-gray-500">
                No earnings data available
              </div>
            )}
          </div>
        </div>

        {/* Rides Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {ridesStats.map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-700/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-300 text-xs md:text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl md:text-4xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-2">Completed Rides</p>
                </div>
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.value > 0 ? `${stat.value}` : "0"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Rides Table - Fully Responsive */}
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 w-full flex flex-col">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">🚗</span> Recent Rides
          </h2>

          {/* Scrollable Table Container */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-gray-700/40">
            <table className="w-full border-collapse min-w-full">
              <thead className="sticky top-0 bg-gray-900/80 z-10">
                <tr className="border-b border-gray-700/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Pickup</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Dropoff</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Distance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Earnings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                </tr>
              </thead>

              <tbody>
                {earnings?.completedRides?.slice(-15).reverse().map((ride, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-800 hover:bg-white/5 transition-colors even:bg-white/2"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(ride.date).toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-300">
                      <span className="line-clamp-1">{ride.pickup}</span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-300">
                      <span className="line-clamp-1">{ride.dropoff}</span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-300">
                      {ride.distance?.toFixed(2)} km
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-green-400">
                      ₹{parseFloat(ride.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {(!earnings?.completedRides || earnings.completedRides.length === 0) && (
              <div className="text-center py-12 text-gray-400">
                <p>No completed rides yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverEarnings;
