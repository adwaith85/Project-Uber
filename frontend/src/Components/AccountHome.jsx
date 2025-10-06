
import React from "react";
import { FaUser } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
function AccountHome() {
    return (
        <div className="w-full h-full ">
            {/* profile img name etc */}
            <div className="w-full h-auto flex flex-col justify-center items-center py-[20px]">
                <div className="w-[90px] h-[90px] rounded-full overflow-auto ">
                    <img
                        src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                        alt=""
                        className="align-middle overflow-auto w-full h-full"
                    />
                </div>
                <h2 className="text-[1.2rem] font-semibold tracking-wider text-center mt-[10px] ">
                    ....
                </h2>
                <h2 className="text-[0.9rem]  tracking-wider text-center text-gray-500  ">
                    ....
                </h2>
            </div>
            {/* Home buttons */}
            <div className="w-full h-[100px] flex justify-between items-center px-[20px]">
                <div className="w-[31%] h-full flex flex-col items-center justify-center bg-gray-200 rounded-xl ">
                    <FaUser className="text-[1.3rem] " />
                    <h2 className="text-[0.9rem] tracking-wider ">Personal info</h2>
                </div>
                <div className="w-[31%] h-full flex flex-col items-center justify-center bg-gray-200 rounded-xl ">
                    <GrShieldSecurity className="text-[1.3rem] " />
                    <h2 className="text-[0.9rem] tracking-wider ">Security</h2>
                </div>
                <div className="w-[31%] h-full flex flex-col items-center justify-center bg-gray-200 rounded-xl ">
                    <RiGitRepositoryPrivateFill className="text-[1.3rem] " />
                    <h2 className="text-[0.9rem] tracking-wider ">Privacy</h2>
                </div>
            </div>
        </div>
    );
}


export default AccountHome