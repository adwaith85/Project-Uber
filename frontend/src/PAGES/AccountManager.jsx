import React, { useState } from "react";
import NavbarX from "../Components/NavbarX";
import AccountHome from "../Components/AccountHome";
import PersonalInfo from "../Components/PersonalInfo";
import Footer from "../Components/Footer";

function AccountManager() {
    const [isActive, setIsActive] = useState("home");

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Navbar */}
            <NavbarX />

            {/* Main Content with padding for sticky navbar */}
            <div className="pt-[70px]">
                {/* Tab Navigation */}
                <div className="bg-white border-b border-gray-200 sticky top-[70px] z-40 shadow-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex overflow-x-auto">
                            <button
                                onClick={() => setIsActive("home")}
                                className={`flex-1 min-w-[120px] py-4 px-6 font-medium transition-all ${isActive === "home"
                                        ? "text-black border-b-4 border-black"
                                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                                    }`}
                            >
                                Home
                            </button>
                            <button
                                onClick={() => setIsActive("personalInfo")}
                                className={`flex-1 min-w-[120px] py-4 px-6 font-medium transition-all ${isActive === "personalInfo"
                                        ? "text-black border-b-4 border-black"
                                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                                    }`}
                            >
                                Personal info
                            </button>
                            <button
                                onClick={() => setIsActive("security")}
                                className={`flex-1 min-w-[120px] py-4 px-6 font-medium transition-all ${isActive === "security"
                                        ? "text-black border-b-4 border-black"
                                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                                    }`}
                            >
                                Security
                            </button>
                            <button
                                onClick={() => setIsActive("privacy")}
                                className={`flex-1 min-w-[120px] py-4 px-6 font-medium transition-all ${isActive === "privacy"
                                        ? "text-black border-b-4 border-black"
                                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                                    }`}
                            >
                                Privacy & Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {isActive === "home" && <AccountHome />}
                    {isActive === "personalInfo" && <PersonalInfo />}
                    {isActive === "security" && (
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold mb-4">Security</h2>
                            <p className="text-gray-600">Security settings coming soon...</p>
                        </div>
                    )}
                    {isActive === "privacy" && (
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold mb-4">Privacy & Data</h2>
                            <p className="text-gray-600">Privacy settings coming soon...</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default AccountManager;