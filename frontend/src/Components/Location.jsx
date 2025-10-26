import React, { useState } from "react";
import { BiSolidNavigation } from "react-icons/bi";
import { FaDotCircle } from "react-icons/fa";
import { TbSquareDotFilled } from "react-icons/tb";

function Location({ onPickupSelect, onDropoffSelect }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchPlaces = async (query, type) => {
    if (!query) return setSuggestions([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await response.json();
      setSuggestions(
        data.map((place) => ({
          name: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          type,
        }))
      );
    } catch (err) {
      console.error("Error fetching place suggestions:", err);
    }
  };

  const handleSelect = (place) => {
    setSuggestions([]);
    if (place.type === "pickup") {
      setPickup(place.name);
      onPickupSelect({ lat: place.lat, lng: place.lon });
    } else {
      setDropoff(place.name);
      onDropoffSelect({ lat: place.lat, lng: place.lon });
    }
  };

  return (
    <div className="flex flex-col gap-[20px] relative md:w-[30%] md:ml-2">
      {/* Pickup */}
      <div className="flex justify-center bg-white">
        <div className="relative w-[90%]">
          <FaDotCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <BiSolidNavigation className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <div className="w-[1.8px] h-[50px] bg-black mt-1 absolute z-2 left-[22.7px] top-6"></div>
          <input
            type="text"
            placeholder="Pickup location"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              fetchPlaces(e.target.value, "pickup");
            }}
            className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-xl mt-1 max-h-48 overflow-y-auto w-full z-10">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Dropoff */}
      <div className="flex justify-center bg-white">
        <div className="relative w-[90%]">
          <TbSquareDotFilled className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <input
            type="text"
            placeholder="Dropoff location"
            value={dropoff}
            onChange={(e) => {
              setDropoff(e.target.value);
              fetchPlaces(e.target.value, "dropoff");
            }}
            className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded-xl mt-1 max-h-48 overflow-y-auto w-full z-10">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Location;


















// import React, { useState } from "react";
// import { BiSolidNavigation } from "react-icons/bi";
// import { FaDotCircle } from "react-icons/fa";
// import { TbSquareDotFilled } from "react-icons/tb";

// function Location() {
//   const [pickup, setPickup] = useState("");
//   const [dropoff, setDropoff] = useState("");

//   return (
//     <div className="flex flex-col gap-[20px] relative md:w-[30%] md:ml-2">
//       {/* Pickup */}
//       <div className="flex justify-center bg-white">
//         <div className="relative w-[90%]">
//           <FaDotCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
//           <BiSolidNavigation className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
//           <div className="w-[1.8px] h-[50px] bg-black mt-1 absolute z-2 left-[22.7px] top-6"></div>

//           <input
//             type="text"
//             placeholder="Pickup location"
//             value={pickup}
//             onChange={(e) => setPickup(e.target.value)}
//             className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
//           />
//         </div>
//       </div>

//       {/* Dropoff */}
//       <div className="flex justify-center bg-white">
//         <div className="relative w-[90%]">
//           <TbSquareDotFilled className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
//           <input
//             type="text"
//             placeholder="Dropoff location"
//             value={dropoff}
//             onChange={(e) => setDropoff(e.target.value)}
//             className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Location;
