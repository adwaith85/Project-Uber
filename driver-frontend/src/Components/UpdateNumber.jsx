import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Car } from "lucide-react";
import DriverStore from "../Store/DriverStore";
import api from "../API/AxiosClient";



function UpdateNumber() {
  const [number, setNumber] = useState("");
  const [carnumber, setCarNumber] = useState("");
  const navigate = useNavigate();
  const token = DriverStore((state) => state.token);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    if (!number.trim() || !carnumber.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both fields' });
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/UpdateDriver",
        { number, carnumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage({ type: 'success', text: 'Details updated successfully!' });
      setTimeout(() => navigate("/Profile"), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update details' });
      console.error("Error updating details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80  rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="pt-8 px-4">
          <Link to="/Profile" className="text-gray-600 hover:text-black transition text-sm font-semibold">
            ← Back to Profile
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center items-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-black text-center">
                Update Details
              </h2>
              <p className="text-gray-700 text-center mb-8">Update your phone and car number</p>

              {/* Phone Number Field */}
              <div className="mb-4">
                <label className="font-semibold mb-2 text-gray-200 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter new phone number"
                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-black placeholder-gray-300 focus:outline-none focus:border-green-500/50 focus:bg-gray-700/50 transition"
                  />
                  {number && (
                    <button
                      type="button"
                      onClick={() => setNumber("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Car Number Field */}
              <div className="mb-6">
                <label className="font-semibold mb-2 text-gray-200 flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-400" />
                  Car Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={carnumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="Enter new car number"
                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-black placeholder-gray-300 focus:outline-none focus:border-orange-500/50 focus:bg-gray-700/50 transition"
                  />
                  {carnumber && (
                    <button
                      type="button"
                      onClick={() => setCarNumber("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-800 to-gray-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-white transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Details'
                )}
              </button>

              {/* Message */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-center font-medium ${message.type === 'success'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateNumber;
