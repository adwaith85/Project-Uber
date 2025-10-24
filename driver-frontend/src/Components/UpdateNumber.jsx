import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DriverStore from "../Store/DriverStore";
import api from "../api/axiosClient";


function UpdateNumber() {
  const [number, setNumber] = useState("");
  const [carnumber, setCarNumber] = useState("");
  const navigate = useNavigate();
  const token = DriverStore((state) => state.token);

  const UpdateData = async () => {
    if (!number.trim() || !carnumber.trim()) {
      alert("Please fill in both fields before updating.");
      return;
    }

    try {
      const response = await api.post(
        "/UpdateDriver",
        { number, carnumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Details updated successfully!");
      console.log(response.data);
      navigate("/Profile");
    } catch (error) {
      console.error("Error updating details:", error);
      alert("Failed to update details. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow font-sans">
      <h2 className="text-2xl font-bold mb-2">Update Details</h2>
      <p className="text-gray-600 mb-6">
        Enter your new phone number and car number below, then click Update.
      </p>

      {/* Phone Number Field */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Phone Number</label>
        <div className="relative">
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter new phone number"
            className="w-full bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none"
          />
          {number && (
            <button
              type="button"
              onClick={() => setNumber("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Car Number Field */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">Car Number</label>
        <div className="relative">
          <input
            type="text"
            value={carnumber}
            onChange={(e) => setCarNumber(e.target.value)}
            placeholder="Enter new car number"
            className="w-full bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none"
          />
          {carnumber && (
            <button
              type="button"
              onClick={() => setCarNumber("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={UpdateData}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
      >
        Update
      </button>
    </div>
  );
}

export default UpdateNumber;
