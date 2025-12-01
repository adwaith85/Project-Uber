import React, { useState, useEffect, useCallback } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DriverStore from "../Store/DriverStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { BanknotesIcon, CalendarDaysIcon, ClockIcon, ArrowPathIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/outline";

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
          const det = await fetch("https://project-uber.onrender.com/Details", {
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

      const res = await fetch(`https://project-uber.onrender.com/driver-earnings/${id}`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-200">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-6 bg-gray-900 hover:bg-black text-white font-semibold py-2 px-6 rounded-lg transition"
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
      }).length || 0, color: "bg-blue-500", icon: <CalendarDaysIcon className="w-6 h-6 text-white" />
    },
    {
      name: "This Year", value: earnings?.completedRides?.filter((r) => {
        const year = new Date(r.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return year === currentYear;
      }).length || 0, color: "bg-green-500", icon: <CalendarDaysIcon className="w-6 h-6 text-white" />
    },
    { name: "Total Rides", value: earnings?.completedRides?.length || 0, color: "bg-orange-500", icon: <BanknotesIcon className="w-6 h-6 text-white" /> },
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Refresh Button */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Earnings Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your financial performance</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => fetchEarnings()}
              className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex-1 md:flex-auto flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition shadow-sm ${autoRefresh
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-gray-100 border border-gray-200 text-gray-600"
                }`}
            >
              {autoRefresh ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              {autoRefresh ? "Auto On" : "Auto Off"}
            </button>
          </div>
        </div>

        {/* Last Refresh Time */}
        <div className="mb-6 text-xs text-gray-400 text-right">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Key Metrics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Earnings</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{totalEarningsLocal.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="font-semibold text-gray-900">{earnings?.completedRides?.length || 0}</span> completed rides
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">This Month</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{monthEarningsLocal.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Current billing cycle
              </p>
            </div>
          </div>

          {/* Today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Today</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{todayEarningsLocal.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">
                  {earnings?.completedRides?.filter((r) => {
                    const today = new Date().toISOString().slice(0, 10);
                    return new Date(r.date).toISOString().slice(0, 10) === today;
                  }).length || 0}
                </span> rides today
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Daily Earnings (Last 7 Days)</h2>
            {earnings && dailyChartData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      cursor={{ fill: "#f9fafb" }}
                    />
                    <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No data available
              </div>
            )}
          </div>

          {/* Monthly Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Earnings Trend</h2>
            {earnings && monthlyChartData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Rides Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Pickup</th>
                  <th className="px-6 py-3">Dropoff</th>
                  <th className="px-6 py-3">Distance</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {earnings?.completedRides?.slice(-15).reverse().map((ride, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(ride.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium max-w-xs truncate">
                      {ride.pickup}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium max-w-xs truncate">
                      {ride.dropoff}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {ride.distance?.toFixed(2)} km
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold">
                      ₹{parseFloat(ride.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View (Cards) */}
          <div className="md:hidden">
            {earnings?.completedRides?.slice(-15).reverse().map((ride, idx) => (
              <div key={idx} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(ride.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{parseFloat(ride.price).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 min-w-[16px]">
                      <div className="h-2 w-2 rounded-full bg-gray-300 ring-2 ring-gray-100"></div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{ride.pickup}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="mt-1 min-w-[16px]">
                      <div className="h-2 w-2 rounded-full bg-black ring-2 ring-gray-100"></div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Dropoff</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{ride.dropoff}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                  <span>Distance: {ride.distance?.toFixed(2)} km</span>
                </div>
              </div>
            ))}
          </div>

          {(!earnings?.completedRides || earnings.completedRides.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              No recent transactions found
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DriverEarnings;
