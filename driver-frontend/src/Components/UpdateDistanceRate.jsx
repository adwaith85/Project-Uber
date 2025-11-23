import React, { useState } from "react";
import api from "../api/axiosClient";
import DriverStore from "../Store/DriverStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Pencil } from "lucide-react";

function UpdateDistanceRate({ initialRate }) {
  const [distancerate, setDistancerate] = useState(initialRate || "");
  const [loading, setLoading] = useState(false);
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

      alert("Distance rate updated successfully");
      navigate("/profile"); // redirect after save
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update distance rate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
      >
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-center"
        >
          Update Distance Rate
        </motion.h2>

        <p className="text-gray-600 text-center text-sm mt-1">
          Set how much you charge per kilometer.
        </p>

        {/* Input */}
        <div className="mt-6">
          <label className="font-medium text-gray-700">
            Distance Rate (₹ per KM)
          </label>
          <input
            type="number"
            value={distancerate}
            onChange={(e) => setDistancerate(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter rate per KM"
          />
        </div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={UpdateRate}
          disabled={loading}
          className={`w-full mt-6 flex items-center justify-center gap-2 p-3 rounded-xl text-white text-lg font-medium transition
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Saving..." : "Save & Go Back"}
          {!loading ? <Save size={20} /> : null}
        </motion.button>
      </motion.div>
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
