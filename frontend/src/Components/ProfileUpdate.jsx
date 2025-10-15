import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../Api/Axiosclient"; // ✅ Make sure this is your Axios instance
import UserStore from "../Store/UserStore"; // ✅ Import your store

function ProfileUpdate() {
  const { token } = UserStore(); // ✅ get token from store
  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Handle image selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setProfileImg(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setProfileImg(null);
    setPreview(null);
  };

  // Upload image to backend
  const UpdateData = async () => {
    if (!profileImg) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("profileimg", profileImg);

    try {
      setUploadStatus("Uploading...");
      const response = await api.post("/updateuser", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      setUploadStatus("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setUploadStatus("Upload failed. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow font-sans">
      <h2 className="text-2xl font-bold mb-2">Profile Image</h2>
      <p className="text-gray-600 mb-6">Update your profile picture here.</p>

      {/* File Input */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border border-black rounded-lg px-3 py-2 focus:outline-none"
        />
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mb-4 text-center">
          <img
            src={preview}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-full mx-auto border border-gray-300"
          />
          <button
            onClick={handleRemoveImage}
            className="mt-2 text-red-500 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {/* Update Button */}
      <button
        onClick={UpdateData}
        className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
      >
        Update
      </button>

      {/* Status Message */}
      {uploadStatus && (
        <p className="mt-3 text-center text-gray-700">{uploadStatus}</p>
      )}

      {/* Link to Account Manager */}
      <div className="mt-4 text-center">
        <Link
          to="/AccountManager"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Account Manager
        </Link>
      </div>
    </div>
  );
}

export default ProfileUpdate;
