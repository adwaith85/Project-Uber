import React, { useState, useRef } from "react";
import { BiSolidNavigation } from "react-icons/bi";
import { FaDotCircle } from "react-icons/fa";
import { TbSquareDotFilled } from "react-icons/tb";
import { Autocomplete } from "@react-google-maps/api";

function Location() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  const handlePlaceChanged = (type) => {
    const place =
      type === "pickup"
        ? pickupRef.current.getPlace()
        : dropoffRef.current.getPlace();

    if (!place || !place.geometry) return;

    const location = place.formatted_address || place.name;
    if (type === "pickup") setPickup(location);
    else setDropoff(location);
  };

  return (
    <div className="flex flex-col gap-[20px] relative md:w-[30%] md:ml-2">
      {/* Pickup */}
      <div className="flex justify-center bg-white">
        <div className="relative w-[90%]">
          <FaDotCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <BiSolidNavigation className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <div className="w-[1.8px] h-[50px] bg-black mt-1 absolute z-2 left-[22.7px] top-6"></div>

          <Autocomplete
            onLoad={(ref) => (pickupRef.current = ref)}
            onPlaceChanged={() => handlePlaceChanged("pickup")}
          >
            <input
              type="text"
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
            />
          </Autocomplete>
        </div>
      </div>

      {/* Dropoff */}
      <div className="flex justify-center bg-white">
        <div className="relative w-[90%]">
          <TbSquareDotFilled className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <Autocomplete
            onLoad={(ref) => (dropoffRef.current = ref)}
            onPlaceChanged={() => handlePlaceChanged("dropoff")}
          >
            <input
              type="text"
              placeholder="Dropoff location"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
            />
          </Autocomplete>
        </div>
      </div>
    </div>
  );
}

export default Location;
