import React, { useState, useMemo, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

function RideAnalyticsChart({ rides }) {
    const [view, setView] = useState("annual");
    const [loading, setLoading] = useState(false);

    // Date Range Filter
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Apply Date Range Filter
    const filteredRides = useMemo(() => {
        if (!startDate || !endDate) return rides;

        return rides.filter((ride) => {
            const d = new Date(ride.date);
            return d >= new Date(startDate) && d <= new Date(endDate);
        });
    }, [rides, startDate, endDate]);

    // Show loading animation on view change
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [view, startDate, endDate]);

    // -----------------------
    // Annual (Jan–Dec)
    // -----------------------
    const annualData = useMemo(() => {
        const months = Array(12).fill(0);

        filteredRides.forEach((ride) => {
            const m = new Date(ride.date).getMonth();
            months[m]++;
        });

        return months.map((count, i) => ({
            label: new Date(0, i).toLocaleString("en-US", { month: "short" }),
            rides: count,
        }));
    }, [filteredRides]);

    // -----------------------
    // Monthly (Week 1–5)
    // -----------------------
    const monthlyData = useMemo(() => {
        const weeks = Array(5).fill(0);

        filteredRides.forEach((ride) => {
            const d = new Date(ride.date);
            const weekIndex = Math.floor((d.getDate() - 1) / 7);
            weeks[weekIndex]++;
        });

        return weeks.map((count, i) => ({
            label: `Week ${i + 1}`,
            rides: count,
        }));
    }, [filteredRides]);

    // -----------------------
    // Weekly (Mon–Sun)
    // -----------------------
    const weeklyData = useMemo(() => {
        const days = Array(7).fill(0);
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        filteredRides.forEach((ride) => {
            let d = new Date(ride.date).getDay();
            d = d === 0 ? 6 : d - 1; // Sunday fix
            days[d]++;
        });

        return days.map((count, i) => ({
            label: dayNames[i],
            rides: count,
        }));
    }, [filteredRides]);

    const chartData =
        view === "annual"
            ? annualData
            : view === "monthly"
                ? monthlyData
                : weeklyData;

    return (
        <div className="md:h-[350px] z-0 h-110 p-3 bg-gray-200 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-gray-600 mb-4">
                Ride Analytics
            </h2>

            {/* DATE RANGE PICKER */}
            {/* <div className="flex justify-center gap-4 mb-1">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-500"
        />
      </div> */}

            {/* BUTTONS */}
            <div className="flex justify-center gap-3 mb-4">
                {["annual", "monthly", "weekly"].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setView(mode)}
                        className={`px-4 py-2 rounded-lg  text-white transition-all ${view === mode
                                ? "bg-gradient-to-r  from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 scale-105"
                                : "bg-gray-600 hovr:bg-gray-600"
                            }`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>

            {/* LOADING SKELETON */}
            {loading ? (
                <div className="w-full h-72 md:h-[200px] animate-pulse bg-gray-600 rounded-xl" />
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view + startDate + endDate}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 2 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-72 md:h-[220px]"
                    >
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="label" stroke="black" />
                                <YAxis stroke="black" />
                                <Tooltip
                                    contentStyle={{
                                        background: "#222",
                                        border: "1px solid #555",
                                        color: "white",
                                    }}
                                />
                                <Bar
                                    dataKey="rides"
                                    fill="url(#glow)"
                                    radius={[6, 6, 0, 0]}
                                />
                                <defs>
                                    {/* Gradient Fill */}
                                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00c6ff" />
                                        <stop offset="100%" stopColor="#0072ff" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}

export default RideAnalyticsChart;
