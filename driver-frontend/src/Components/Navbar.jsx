import React, { useEffect, useState } from "react";
import { Menu, LogOut, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import DriverStore from "../Store/DriverStore";
import api from "../api/axiosClient";


function Navbar() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const [driverData, setDriverData] = useState(null);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const { token, logout } = DriverStore();

  const menuItems = [
    { name: "Dashboard", path: "/home" },
    { name: "Earnings", path: "/earnings" },
    { name: "Trips", path: "/trips" },
    { name: "Profile", path: "/Profile" },
    { name: "Support", path: "/support" },
  ];

  // 🧠 Decode JWT helper
  // const decodeJWT = (token) => {
  //   try {
  //     const base64Url = token.split(".")[1];
  //     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  //     const jsonPayload = decodeURIComponent(
  //       atob(base64)
  //         .split("")
  //         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
  //         .join("")
  //     );
  //     return JSON.parse(jsonPayload);
  //   } catch {
  //     return null;
  //   }
  // };

  // 🎯 Fetch driver profile when token available
  const { data, isLoading, error } = useQuery({
    queryKey: ['driver'],
    queryFn: async () => {
      const res = await api.get('/Details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    enabled: !!token,
  });


  // console.log("User data from API:", data);

  if (isLoading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error loading data</p>;


  // 🚪 Handle logout
  const handleLogout = () => {
    api
      .get("driverlogout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        logout();
        // setDriverData(null);
        navigate("/");
      })
      .catch((err) => console.error("error:", err))
  };

  return (
    <div className="flex flex-col bg-gray-100 text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white shadow-md">
        {/* Left Section: Drawer + Driver Info */}
        <div className="flex items-center gap-3">
          {/* Drawer Button */}
          <button onClick={toggleDrawer} className="p-2 rounded hover:bg-gray-200">
            <Menu className="w-6 h-6" />
          </button>

          {/* Driver Info */}
          {data ? (
            <div className="flex items-center gap-2">
              {data.profileimg ? (
                <img
                  src={data?.profileimg}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-gray-500" />
              )}
              <span className="font-medium text-gray-800 text-sm truncate max-w-[100px]">
                {data.name || "Driver"}
              </span>
            </div>
          ) : (
            token && (
              <span className="text-red-500 text-sm font-medium">User not found</span>
            )
          )}
        </div>

        {/* Center Title */}
        <h1 className="text-lg font-semibold tracking-wide">Driver Dashboard</h1>

        {/* Logout Button */}
        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-sm font-medium">Logout</span>
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium hover:underline text-blue-600"
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
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-30 p-6 flex flex-col"
            >
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                Menu
              </h3>

              {/* Menu Links */}
              <nav className="flex flex-col space-y-3">
                {menuItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className="hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                    onClick={toggleDrawer}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Close button */}
              <button
                onClick={toggleDrawer}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg"
              >
                Close
              </button>
            </motion.aside>

            {/* Backdrop */}
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
