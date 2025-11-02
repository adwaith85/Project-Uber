import React, { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import DriverStore from "../Store/DriverStore";

function Navbar() {
    const navigate=useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const logout = DriverStore((state) => state.logout);
    const menuItems = [
        { name: "Dashboard", path: "/home" },
        { name: "Earnings", path: "/earnings" },
        { name: "Trips", path: "/trips" },
        { name: "Profile", path: "/Profile" },
        { name: "Support", path: "/support" },
    ];

    return (
        <div className="flex flex-col  bg-gray-100 text-gray-900">
            {/* Navbar */}
            <header className="sticky top-1 z-1 flex items-center justify-between px-6 py-3 bg-white shadow-md">
                {/* Drawer Button (Left) */}
                <button onClick={toggleDrawer} className="p-2 rounded hover:bg-gray-200">
                    <Menu className="w-6 h-6" />
                </button>

                {/* Title */}
                <h1 className="text-lg font-semibold tracking-wide">Driver Dashboard</h1>

                {/* Logout Button (Right) */}
                <button
                onClick={() => {
                logout();
                navigate("/")
              }} 
                className="flex items-center gap-2 hover:opacity-80">
                    <span className="text-sm font-medium">Logout</span>
                    <LogOut className="w-5 h-5" />
                </button>
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

                            {/* Menu links - stacked vertically */}
                            <nav className="flex flex-col space-y-3">
                                {menuItems.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        to={item.path}
                                        className="hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Close button at bottom */}
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
