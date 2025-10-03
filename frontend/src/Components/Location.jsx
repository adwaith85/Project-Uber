import React from 'react'
import { BiSolidNavigation } from "react-icons/bi";
import { FaDotCircle } from "react-icons/fa";
import { TbSquareDotFilled } from "react-icons/tb";
import { Link } from "react-router-dom"

function Location() {
    return (<>
        

        <div className=' flex flex-col gap-[20px] relative'>
            <div className=" flex justify-center bg-white  ">
                <div className="relative w-[90%]">

                    <FaDotCircle
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 object-cover"
                    />
                    <BiSolidNavigation
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 object-cover"
                    /> <div className="w-[1.8px] h-[50px] bg-black mt-1 absolute z-2 left-[22.7px] top-6"></div>
                    <input
                        type="text"
                        placeholder="Pickup location"
                        className=" w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
                    />
                </div>

            </div>

            <div className="flex justify-center bg-white ">
                <div className="relative w-[90%]">

                    <TbSquareDotFilled
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 object-cover"
                    />
                    <input
                        type="text"
                        placeholder="Dropoff location"
                        className=" w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
                    />
                </div>
            </div>
            

        </div>

    </>)
}

export default Location