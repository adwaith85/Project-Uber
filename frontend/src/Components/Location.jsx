import React, { useState, useEffect } from "react";
import { BiSolidNavigation } from "react-icons/bi";
import { FaDotCircle } from "react-icons/fa";
import { TbSquareDotFilled } from "react-icons/tb";

function Location({ onPickupSelect, 
  onDropoffSelect,
  pickuplocationnameref ,
dropofflocationnameref}) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState({ value: "", type: "" }); 

  const fetchPlaces = async (searchQuery, type) => {
    if (!searchQuery) return setSuggestions([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
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

  useEffect(() => {
    if (!query.value) return setSuggestions([]);

    const handler = setTimeout(() => {
      fetchPlaces(query.value, query.type);
    }, 1000); // 2 seconds debounce

    return () => {
      clearTimeout(handler); 
    };
  }, [query]);

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
    <div className="flex flex-col w-full -ml-2 gap-[20px] relative md:w-[60%] md:ml-2">
      {/* Pickup input */}
      <div className="flex justify-center bg-white">
        <div className="relative w-[90%] ">
          <FaDotCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <BiSolidNavigation className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 md:left-77 " />
          <input
            ref={pickuplocationnameref}
            type="text"
            placeholder="Pickup location"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              setQuery({ value: e.target.value, type: "pickup" }); // trigger debounce
            }}
            className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none md:w-[350px] md:pl-13  md:text-left "
          />
        </div>
      </div>

      {/* Dropoff input */}
      <div className="flex justify-center bg-white">
        <div className="relative w-[90%]">
          <TbSquareDotFilled className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6" />
          <input
            ref={dropofflocationnameref}
            type="text"
            placeholder="Dropoff location"
            value={dropoff}
            onChange={(e) => {
              setDropoff(e.target.value);
              setQuery({ value: e.target.value, type: "dropoff" }); // trigger debounce
            }}
            className="w-full bg-gray-200 text-left pl-12 pr-12 py-3 border-none rounded-xl outline-none md:w-[350px] md:pl-13 "
          />
        </div>
      </div>

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <ul className="lg:w-full md:ml-[50px] absolute bg-white border rounded-xl mt-30 max-h-48 overflow-y-auto ml-[50px] z-20">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => handleSelect(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {s.name}
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Location;
