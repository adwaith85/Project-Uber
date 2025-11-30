import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, X, Check, ArrowLeft } from "lucide-react";
import api from "../Api/Axiosclient";
import UserStore from "../Store/UserStore";
import NavbarX from "./NavbarX";
import Footer from "./Footer";

function ProfileUpdate() {
  const { token } = UserStore();
  const navigate = useNavigate();
  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Handle image selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Check file size (max 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setUploadStatus("File size must be less than 2MB");
        return;
      }

      setProfileImg(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setUploadStatus("");
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setProfileImg(null);
    setPreview(null);
    setUploadStatus("");
  };

  // Upload image to backend
  const UpdateData = async () => {
    if (!profileImg) {
      setUploadStatus("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("profileimg", profileImg);

    try {
      setIsUploading(true);
      setUploadStatus("Uploading...");

      const response = await api.post("/updateuser", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      setUploadStatus("Profile updated successfully!");

      setTimeout(() => {
        navigate("/AccountManager");
      }, 1500);
    } catch (error) {
      console.error(error);
      setUploadStatus("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <NavbarX />

      <div className="min-h-screen bg-gray-50 pt-[70px]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link
            to="/AccountManager"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Account</span>
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white">
              <h2 className="text-2xl font-bold">Update Profile Picture</h2>
              <p className="text-gray-300 mt-1">Upload a new photo to personalize your account</p>
            </div>

            <div className="p-8">
              {/* Image Preview */}
              {preview ? (
                <div className="mb-8 text-center">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-full mx-auto border-4 border-gray-200 shadow-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">Preview of your new profile picture</p>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300">
                    <Upload className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="mt-4 text-center text-sm text-gray-600">No image selected</p>
                </div>
              )}

              {/* File Input */}
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-3">Select Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-medium hover:file:bg-gray-800 file:cursor-pointer"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Supported formats: JPG, PNG, GIF • Max size: 2MB
                </p>
              </div>

              {/* Status Message */}
              {uploadStatus && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${uploadStatus.includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : uploadStatus.includes("failed") || uploadStatus.includes("must")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                  {uploadStatus.includes("success") && <Check className="w-5 h-5" />}
                  <p className="font-medium">{uploadStatus}</p>
                </div>
              )}

              {/* Update Button */}
              <button
                onClick={UpdateData}
                disabled={!profileImg || isUploading}
                className={`w-full py-4 rounded-lg font-semibold transition shadow-md ${!profileImg || isUploading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                {isUploading ? "Uploading..." : "Update Profile Picture"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ProfileUpdate;
