import React, { useState } from "react";
import { Link } from "react-router-dom";
import DriverStore from "../Store/DriverStore";
import api from "../api/axiosClient";


function UpdateProfile() {
  const { token } = DriverStore();
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
      const response = await api.post("/UpdateDriver", formData, {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
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
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Update Profile
              </h2>
              <p className="text-gray-400 mb-8">Change your profile picture</p>

              {/* File Input */}
              <div className="mb-6">
                <label className="block font-semibold mb-3 text-gray-300">Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-gray-700/50 transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"
                />
              </div>

              {/* Image Preview */}
              {preview && (
                <div className="mb-6 text-center">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-full mx-auto border-4 border-orange-500/50 shadow-lg shadow-orange-500/20"
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="mt-4 px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Update Button */}
              <button
                onClick={UpdateData}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Profile
              </button>

              {/* Status Message */}
              {uploadStatus && (
                <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                  uploadStatus.includes('successfully')
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : uploadStatus.includes('Uploading')
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {uploadStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile