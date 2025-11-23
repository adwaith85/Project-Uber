import React, { useState } from "react";
import api from "../api/axiosClient";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="pt-8 px-4">
          <Link to="/Profile" className="text-orange-400 hover:text-orange-300 transition text-sm font-semibold">
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
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
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
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className={`mt-4 p-3 rounded-lg text-center font-medium ${
                    message.type === 'success'
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

















// import React, { useState } from "react";
// import api from "../api/axiosClient";
// import DriverStore from "../Store/DriverStore";

// function UpdateDistanceRate({ initialRate }) {
//   const [distancerate, setDistancerate] = useState(initialRate || "");
//   const [editing, setEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//     const token = DriverStore ((state) => state.token);

//   const UpdateRate = async () => {
//     if (distancerate === "" || Number(distancerate) <= 0) {
//       alert("Please enter a valid distance rate");
//       return;
//     }
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/updatedistancerate",
//         { distancerate },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert("Distance rate updated successfully");
//       setEditing(false);
//     } catch (error) {
//       console.error(error);
//       alert(
//         error.response?.data?.message || "Failed to update distance rate"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         padding: "20px",
//         maxWidth: "350px",
//         border: "1px solid #ddd",
//         borderRadius: "8px",
//       }}
//     >
//       <h3>Distance Rate (per KM)</h3>

//       <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//         <input
//           type="number"
//           value={distancerate}
//           readOnly={!editing || loading}
//           onChange={(e) => setDistancerate(e.target.value)}
//           style={{
//             flex: 1,
//             padding: "10px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//             background: editing ? "white" : "#f1f1f1",
//             cursor: editing ? "text" : "not-allowed",
//           }}
//         />

//         {!editing ? (
//           <button
//             onClick={() => setEditing(true)}
//             style={{
//               padding: "8px 12px",
//               background: "#007bff",
//               color: "white",
//               borderRadius: "6px",
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Edit
//           </button>
//         ) : (
//           <button
//             onClick={UpdateRate}
//             disabled={loading}
//             style={{
//               padding: "8px 12px",
//               background: loading ? "#999" : "green",
//               color: "white",
//               borderRadius: "6px",
//               border: "none",
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//           >
//             {loading ? "Saving..." : "Save"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default UpdateDistanceRate;
