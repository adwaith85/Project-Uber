import React, { useEffect, useState } from "react";
import { Menu, LogOut, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ⬅️ Added useLocation
import { useQuery } from '@tanstack/react-query';
import DriverStore from "../Store/DriverStore";
import api from "../api/axiosClient";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // ⬅️ Track current route
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const { token, logout } = DriverStore();

  const menuItems = [
    { name: "Dashboard", path: "/home" },
    { name: "Earnings", path: "/driverearnings" },
    { name: "Trips", path: "/tripspage" },
    { name: "Profile", path: "/profile" },
    { name: "Support", path: "/support" },
  ];

  // 🎯 Fetch driver profile
  const { data, isLoading, error } = useQuery({
    queryKey: ['driver'],
    queryFn: async () => {
      const res = await api.get('/Details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  if (isLoading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error loading data</p>;

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

  // 🧭 Automatically update title based on current route
  const currentTitle =
    menuItems.find((item) => location.pathname.startsWith(item.path))?.name ||
    { name: "driver" }.name;

  return (
    <div className="flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-black shadow-1x2 backdrop-blur-sm">
        {/* Left Section */}
        <div className="flex items-center gap-3 ">
          <button onClick={toggleDrawer} className="p-2 rounded hover:bg-orange-500/20 transition text-black">
            <Menu className="w-6 h-6" />
          </button>

          {data ? (
            <div className="flex items-center gap-2">
              {data.profileimg ? (
                <img
                  src={data.profileimg}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-orange-500/50"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-black" />
              )}
              <div className="flex flex-col">
                <span className="font-medium text-black text-sm truncate max-w-[100px]">
                {data.name || "Driver"}
              </span>
                <span className="font-medium text-black text-xs truncate max-w-[100px]">
                Rate-{data.distancerate || "NaN"}/<strong/>km
              </span>
              </div>
            </div>
          ) : (
            token && <span className="text-red-600 text-sm font-medium">User not found</span>
          )}
        </div>

        {/* Center Title — Dynamically changes */}
        <h1 className="text-lg font-semibold tracking-wide text-black hidden md:block">
          {currentTitle}
        </h1>

        {/* Logout Button */}
        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 hover:text-red-700 transition font-medium border border-red-500/50"
          >
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/50 transition"
          >
            Login
          </button>
        )}
      </header>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-30 p-6 flex flex-col border-r border-black"
            >
              <h3 className="text-lg font-semibold mb-4 border-b border-black pb-2 text-black">
                Menu
              </h3>

              {/* Menu Links */}
              <nav className="flex flex-col space-y-2">
                {menuItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`rounded-lg px-4 py-2.5 transition-all font-medium ${
                      location.pathname.startsWith(item.path)
                        ? "bg-gray-200 text-gray-900 border border-black"
                        : "text-gray-900 hover:text-black hover:bg-gray-700/50"
                    }`}
                    onClick={toggleDrawer}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <button
                onClick={toggleDrawer}
                className="mt-auto bg-gradient-to-r from-red-900/30 to-red-400/50 hover:from-red-500/50 hover:to-red-600/50 text-red-600 font-medium py-2 rounded-lg border border-red-500/50 transition"
              >
                Close
              </button>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
              className="fixed inset-0 bg-black z-20"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;
