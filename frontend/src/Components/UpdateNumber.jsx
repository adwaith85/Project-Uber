import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserStore from "../Store/UserStore";
import api from "../Api/Axiosclient";

function UpdateNumber() {
  const [number, setNumber] = useState("");
  const navigate = useNavigate();
  const token = UserStore((state) => state.token);
  const UpdateData = async () => {
    if (!number.trim()) {
      alert("Please enter a number before updating.");
      return;
    }

    try {
      const response = await api.post(
        "/updateuser",
        { number },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Number updated successfully!");
      console.log(response.data);
      navigate("/AccountManager"); // ✅ navigate after successful update
    } catch (error) {
      console.error("Error updating number:", error);
      alert("Failed to update number. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow font-sans">
      <h2 className="text-2xl font-bold mb-2">Update Number</h2>
      <p className="text-gray-600 mb-6">
        Enter your new number below and click Update to save changes.
      </p>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Phone Number</label>
        <div className="relative">
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter your new number"
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
