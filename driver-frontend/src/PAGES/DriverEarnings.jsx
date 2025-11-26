import React, { useState, useEffect, useCallback } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
  const token = DriverStore((state) => state.token);
  const navigate = useNavigate();

  // Memoized fetch function for real-time updates
  const fetchEarnings = useCallback(async () => {
    try {
      let id = driverId;

      // If driverId not present in store but token exists, fetch driver details to obtain id
      if (!id && token) {
        try {
          const det = await fetch("http://localhost:8080/Details", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (det.ok) {
            const jd = await det.json();
            id = jd._id || jd.id || null;
          }
        } catch (e) {
          console.warn("Could not fetch /Details to resolve driver id", e);
        }
      }

      if (!id) {
        // no id available; surface a helpful message but don't throw
        setError("Driver ID not found. Please log in again.");
        return;
      }

      const res = await fetch(`http://localhost:8080/driver-earnings/${id}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch earnings: ${res.status} ${txt}`);
      }
      const data = await res.json();
      setEarnings(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("fetchEarnings error:", err);
      setError(err.message || "Failed to fetch earnings");
    }
  }, [driverId, token]);

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
  // Build daily data for the last 7 days (aggregate by day)
  // Helper to parse price values coming from backend (supports number, string, and Decimal128-like objects)
  const parsePriceValue = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const p = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      return Number.isFinite(p) ? p : 0;
    }
    if (typeof val === "object") {
      // handle MongoDB Decimal128 representation: { $numberDecimal: "123.45" }
      if (val.$numberDecimal) {
        const p = parseFloat(String(val.$numberDecimal));
        return Number.isFinite(p) ? p : 0;
      }
      // sometimes stored as {value: '123.45'} or other nested shapes
      const str = JSON.stringify(val);
      const m = str.match(/-?\d+(?:\.\d+)?/);
      if (m) return parseFloat(m[0]);
      return 0;
    }
    return 0;
  };
  const buildDailyData = () => {
    const days = [];
    const today = new Date();
    // create keys for last 7 days (YYYY-MM-DD)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ key, label, earnings: 0 });
    }

    (earnings?.completedRides || []).forEach((ride) => {
      const k = new Date(ride.date).toISOString().slice(0, 10);
      const item = days.find((d) => d.key === k);
      if (item) item.earnings += parsePriceValue(ride.price);
    });

    return days.map((d) => ({ date: d.label, earnings: Number(d.earnings || 0) }));
  };

  const dailyChartData = buildDailyData();

  // Build monthly data for the last 6 months (aggregate by month)
  const buildMonthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months.push({ key, label, earnings: 0 });
    }

    (earnings?.completedRides || []).forEach((ride) => {
      const dt = new Date(ride.date);
      const k = dt.toISOString().slice(0, 7);
      const item = months.find((m) => m.key === k);
      if (item) item.earnings += parsePriceValue(ride.price);
    });

    return months.map((m) => ({ month: m.label, earnings: Number(m.earnings || 0) }));
  };

  const monthlyChartData = buildMonthlyData();

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

  // Compute totals locally (more robust than trusting backend string fields)
  const completedRides = earnings?.completedRides || [];
  const totalEarningsLocal = completedRides.reduce((s, r) => s + parsePriceValue(r.price), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayEarningsLocal = completedRides
    .filter((r) => new Date(r.date).toISOString().slice(0, 10) === todayKey)
    .reduce((s, r) => s + parsePriceValue(r.price), 0);
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthEarningsLocal = completedRides
    .filter((r) => new Date(r.date).toISOString().slice(0, 7) === monthKey)
    .reduce((s, r) => s + parsePriceValue(r.price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Header with Refresh Button */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">💰 Earnings Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Track your daily, monthly, and annual earnings</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchEarnings()}
              className="flex-1 sm:flex-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 md:px-6 rounded-lg transition text-sm md:text-base"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex-1 sm:flex-auto font-semibold py-2 px-3 md:px-4 rounded-lg transition text-sm md:text-base ${autoRefresh
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                }`}
            >
              {autoRefresh ? "📡 Auto" : "⏸ Auto"}
            </button>
          </div>
        </div>

        {/* Last Refresh Time */}
        <div className="mb-6 text-xs md:text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Key Metrics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8 border-l-4 border-orange-500 hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-600 text-xs md:text-sm font-medium uppercase tracking-wide">Total Earnings</p>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">
                  ₹{totalEarningsLocal.toFixed(2)}
                </h3>
              </div>
              <div className="text-3xl md:text-4xl">📊</div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">{earnings?.completedRides?.length || 0} completed rides</p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-600 text-xs md:text-sm font-medium uppercase tracking-wide">This Month</p>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">
                  ₹{monthEarningsLocal.toFixed(2)}
                </h3>
              </div>
              <div className="text-3xl md:text-4xl">📅</div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
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
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8 border-l-4 border-green-500 hover:shadow-xl transition sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-600 text-xs md:text-sm font-medium uppercase tracking-wide">Today</p>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">
                  ₹{todayEarningsLocal.toFixed(2)}
                </h3>
              </div>
              <div className="text-3xl md:text-4xl">📱</div>
            </div>
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
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
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
              <span className="text-2xl mr-2">📈</span> <span className="line-clamp-1">Daily Earnings (Last 7 Days)</span>
            </h2>
            {earnings && dailyChartData.length > 0 ? (
              <div className="w-full h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "0.75rem" }} interval={0} tick={{ fill: '#374151' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: "0.75rem" }} domain={[0, 'dataMax']} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />
                    <Bar dataKey="earnings" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={18} />
                    <Line type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 md:h-80 flex items-center justify-center text-gray-500">
                No earnings data available
              </div>
            )}
          </div>

          {/* Monthly Earnings Chart */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
              <span className="text-2xl mr-2">📊</span> <span className="line-clamp-1">Monthly Earnings Trend</span>
            </h2>
            {earnings && monthlyChartData.length > 0 ? (
              <div className="w-full h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "0.75rem" }} interval={0} tick={{ fill: '#374151' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: "0.75rem" }} domain={[0, 'dataMax']} tickFormatter={(v) => `₹${v}`} />
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
                    <Bar dataKey="earnings" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={24} />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
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
            <div key={idx} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs md:text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">Completed Rides</p>
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
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full h-[80vh] flex flex-col">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🚗</span> Recent Rides
          </h2>

          {/* Scrollable Table Container */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr className="border-b border-gray-300">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Pickup</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Dropoff</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Distance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Earnings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                </tr>
              </thead>

              <tbody>
                {earnings?.completedRides?.slice(-15).reverse().map((ride, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors even:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(ride.date).toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="line-clamp-1">{ride.pickup}</span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="line-clamp-1">{ride.dropoff}</span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {ride.distance?.toFixed(2)} km
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ₹{parseFloat(ride.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
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
