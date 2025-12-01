import React, { useState } from "react";
import api from "../API/AxiosClient";
import DriverStore from "../Store/DriverStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Zap } from "lucide-react";
import { Link } from "react-router-dom";

function UpdateDistanceRate({ initialRate }) {
  const [distancerate, setDistancerate] = useState(initialRate || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = DriverStore((state) => state.token);
  const navigate = useNavigate();

  const UpdateRate = async () => {
    if (distancerate === "" || Number(distancerate) <= 0) {
      alert("Please enter a valid distance rate");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/updatedistancerate",
        { distancerate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: 'success', text: 'Distance rate updated successfully!' });
      setTimeout(() => navigate("/Profile"), 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update rate' });
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
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-black backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                    Distance Rate
                  </h2>
                  <p className="text-gray-400 text-sm">Per kilometer charge</p>
                </div>
              </motion.div>

              {/* Input */}
              <div className="mb-6">
                <label className="font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  Rate (₹ per KM)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={distancerate}
                    onChange={(e) => setDistancerate(e.target.value)}
                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 pl-8 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-700/50 transition"
                    placeholder="Enter rate"
                  />
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={UpdateRate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-900 to-gray-800 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-white transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Rate
                  </>
                )}
              </motion.button>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-lg text-center font-medium ${message.type === 'success'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}
                >
                  {message.text}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default UpdateDistanceRate;
