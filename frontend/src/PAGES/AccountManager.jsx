import React, { useState } from "react";
import NavbarX from "../Components/NavbarX";
import AccountHome from "../Components/AccountHome";
import PersonalInfo from "../Components/PersonalInfo";

function AccountManager() {
    const [isActive, setIsAtive] = useState("home");
    return (
        <div className="w-full h-[100vh]">
            {/* Navbar */}
            <div className="">
                <NavbarX />
            </div>
            {/* Body */}
            <div className="w-full h-full">
                {/* (Deskto view left) account menu */}
                <div className="w-full h-auto  flex  border-b-4 border-b-gray-200 ">
                    <button
                        onClick={(e) => setIsAtive("home")}
                        className="w-[25%] py-[20px] hover:border-b-4 ">
                        Home
                    </button>
                    <button
                        onClick={(e) => setIsAtive("personalInfo")}
                        className="w-[25%] py-[20px] hover:border-b-4 ">
                        Personal info
                    </button>
                    <button
                        onClick={(e) => setIsAtive("security")}
                        className="w-[25%] py-[20px] hover:border-b-4 ">
                        Security
                    </button>
                    <button
                        onClick={(e) => setIsAtive("privacy")}
                        className="w-[25%] py-[20px] hover:border-b-4 ">
                        Privacy&Data
                    </button>
                </div>
                {/* (desktop view right) content srction */}
                <div className="w-full">
                    {
                        isActive === "home" ? <AccountHome /> : <></>
                    }
                    {
                        isActive === "personalInfo" ? <PersonalInfo /> : <></>
                    }
                </div>
            </div>
        </div>
    );
}
export default AccountManager