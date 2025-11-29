import React, { useState } from "react";
import {
  Menu,
  LogOut,
  UserCircle,
  LayoutDashboard,
  Wallet,
  Map,
  User,
  Headphones,
  X,
  ChevronRight,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import DriverStore from "../Store/DriverStore";
import api from "../api/axiosClient";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const { token, logout } = DriverStore();

  const menuItems = [
    { name: "Dashboard", path: "/home", icon: LayoutDashboard },
    { name: "Earnings", path: "/driverearnings", icon: Wallet },
    { name: "Trips", path: "/tripspage", icon: Map },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Support", path: "/support", icon: Headphones },
  ];

  // Fetch driver profile
  const { data, isLoading } = useQuery({
    queryKey: ['driver'],
    queryFn: async () => {
      const res = await api.get('/Details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  const handleLogout = () => {
    api.get("driverlogout", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        logout();
        navigate("/");
      })
      .catch((err) => console.error("error:", err))
  };

  const currentTitle = menuItems.find((item) => location.pathname.startsWith(item.path))?.name || "Driver App";

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full font-sans">
      {/* Navbar Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">

        {/* Left: Menu & Profile */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDrawer}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>

          {data ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                {data.profileimg ? (
                  <img
                    src={data.profileimg}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <UserCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="font-semibold text-gray-900 text-sm leading-tight">
                  {data.name || "Driver"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">₹{data.distancerate || "0"}/km</span>
                  <span className="text-gray-300">•</span>
                  <span className="capitalize">{data.cartype || "Car"}</span>
                </div>
              </div>
            </div>
          ) : (
            token && <span className="text-red-500 text-sm font-medium">Guest</span>
          )}
        </div>

        {/* Center: Title (Desktop only) */}
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-900 hidden md:block tracking-tight">
          {currentTitle}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all text-sm font-medium group"
            >
              <span className="hidden sm:inline">Logout</span>
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition shadow-sm"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Menu</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Navigate your dashboard</p>
                </div>
                <button
                  onClick={toggleDrawer}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item, idx) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={toggleDrawer}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                        ? "bg-black text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Need Help?</p>
                      <p className="text-xs text-gray-500">Support is 24/7</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { toggleDrawer(); navigate("/support"); }}
                    className="w-full py-2 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition"
                  >
                    Contact Support
                  </button>
                </div>

                <p className="text-center text-[10px] text-gray-400 mt-4">
                  v2.4.0 • Driver App
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;
