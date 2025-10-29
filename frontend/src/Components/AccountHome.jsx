import React, { useEffect, useState } from 'react';
import { FaUser } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
import { useQuery } from '@tanstack/react-query';
import api from '../Api/Axiosclient';
import UserStore from '../Store/UserStore';


function AccountHome() {

    const token = UserStore((state) => state.token);

    const { data, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await api.get('/GetDetails', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data;
        },
        enabled: !!token,
    });


    console.log("User data from API:", data);

    if (isLoading) return <p className="text-center mt-4">Loading...</p>;
    if (error) return <p className="text-center mt-4 text-red-500">Error loading data</p>;


    return (
        <div className="w-full h-full ">
            {/* profile img name etc */}
            <div className="w-full h-auto flex flex-col justify-center items-center py-[20px]">
                <div className="w-[90px] h-[90px] rounded-full overflow-hidden ">
                    <img
                        src={data?.profileimg || "https://via.placeholder.com/80"}
                        alt=""
                        className="align-middle overflow-hidden w-full h-full"
                    />
                </div>
                <h2 className="text-[1.2rem] font-semibold tracking-wider text-center mt-[10px] ">
                    {data?.name ?? "Not found"}
                </h2>
                <h2 className="text-[0.9rem]  tracking-wider text-center text-gray-500  ">
                    {data?.email ?? "Not found"}
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