import React, { useState } from "react";
import api from "../api/axiosClient";
import DriverStore from "../Store/DriverStore";

function UpdateDistanceRate({ initialRate }) {
  const [distancerate, setDistancerate] = useState(initialRate || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
    const token = DriverStore ((state) => state.token);

  const UpdateRate = async () => {
    if (distancerate === "" || Number(distancerate) <= 0) {
      alert("Please enter a valid distance rate");
      return;
    }
    try {
      setLoading(true);

      const response = await api.post(
        "/updatedistancerate",
        { distancerate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Distance rate updated successfully");
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Failed to update distance rate"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "350px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Distance Rate (per KM)</h3>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="number"
          value={distancerate}
          readOnly={!editing || loading}
          onChange={(e) => setDistancerate(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: editing ? "white" : "#f1f1f1",
            cursor: editing ? "text" : "not-allowed",
          }}
        />

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "8px 12px",
              background: "#007bff",
              color: "white",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        ) : (
          <button
            onClick={UpdateRate}
            disabled={loading}
            style={{
              padding: "8px 12px",
              background: loading ? "#999" : "green",
              color: "white",
              borderRadius: "6px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}

export default UpdateDistanceRate;
