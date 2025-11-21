import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DriverStore from "../Store/DriverStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const driverId = DriverStore((state) => state.user?._id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!driverId) {
      setError("Driver ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchEarnings = async () => {
      try {
        const res = await fetch(`http://localhost:8080/driver-earnings/${driverId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch earnings");
        }
        const data = await res.json();
        setEarnings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [driverId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition"
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
    { name: "This Month", value: earnings?.completedRides?.filter((r) => {
      const month = new Date(r.date).toISOString().slice(0, 7);
      const currentMonth = new Date().toISOString().slice(0, 7);
      return month === currentMonth;
    }).length || 0, color: "#3b82f6" },
    { name: "This Year", value: earnings?.completedRides?.filter((r) => {
      const year = new Date(r.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return year === currentYear;
    }).length || 0, color: "#10b981" },
    { name: "Total", value: earnings?.completedRides?.length || 0, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Earnings Dashboard</h1>
          <p className="text-gray-600">Track your daily, monthly, and annual earnings</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500 hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Earnings</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">
                  ₹{parseFloat(earnings?.totalEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="text-4xl">📊</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">{earnings?.completedRides?.length || 0} completed rides</p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">This Month</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">
                  ₹{parseFloat(earnings?.monthEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="text-4xl">📅</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {earnings?.completedRides?.filter((r) => {
                  const month = new Date(r.date).toISOString().slice(0, 7);
                  const currentMonth = new Date().toISOString().slice(0, 7);
                  return month === currentMonth;
                }).length || 0} rides this month
              </p>
            </div>
          </div>

          {/* Today */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-green-500 hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Today</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">
                  ₹{parseFloat(earnings?.todayEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="text-4xl">📱</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {earnings?.completedRides?.filter((r) => {
                  const today = new Date().toISOString().slice(0, 10);
                  return new Date(r.date).toISOString().slice(0, 10) === today;
                }).length || 0} rides today
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Earnings Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📈</span> Daily Earnings (Last 7 Days)
            </h2>
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => `₹${value.toFixed(2)}`}
                  />
                  <Bar dataKey="earnings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No earnings data available
              </div>
            )}
          </div>

          {/* Monthly Earnings Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📊</span> Monthly Earnings Trend
            </h2>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => `₹${value.toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No earnings data available
              </div>
            )}
          </div>
        </div>

        {/* Rides Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {ridesStats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.name}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">Completed Rides</p>
                </div>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.value > 0 ? `${stat.value}` : "0"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Rides Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">🚗</span> Recent Rides
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pickup</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dropoff</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Distance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Earnings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {earnings?.completedRides?.slice(-10).reverse().map((ride, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(ride.date).toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 truncate">{ride.pickup}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 truncate">{ride.dropoff}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{ride.distance?.toFixed(2)} km</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{parseFloat(ride.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!earnings?.completedRides || earnings.completedRides.length === 0) && (
              <div className="text-center py-12 text-gray-500">
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
