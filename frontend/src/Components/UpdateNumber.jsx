import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Check, AlertCircle } from "lucide-react";
import UserStore from "../Store/UserStore";
import api from "../Api/Axiosclient";
import NavbarX from "./NavbarX";
import Footer from "./Footer";

function UpdateNumber() {
  const [number, setNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const navigate = useNavigate();
  const token = UserStore((state) => state.token);

  const validatePhoneNumber = (phone) => {
    // Basic validation - adjust regex based on your requirements
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const UpdateData = async () => {
    if (!number.trim()) {
      setUpdateStatus("Please enter a phone number");
      return;
    }

    if (!validatePhoneNumber(number)) {
      setUpdateStatus("Please enter a valid phone number (10-15 digits)");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateStatus("Updating...");

      const response = await api.post(
        "/updateuser",
        { number: number.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUpdateStatus("Phone number updated successfully!");
      console.log(response.data);

      setTimeout(() => {
        navigate("/AccountManager");
      }, 1500);
    } catch (error) {
      console.error("Error updating number:", error);
      setUpdateStatus("Failed to update phone number. Please try again.");
    } finally {
      setIsUpdating(false);
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
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Update Phone Number</h2>
                  <p className="text-gray-300 mt-1">Keep your contact information up to date</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 mb-8">
                Enter your new phone number below. This number will be used for account verification
                and important notifications about your rides.
              </p>

              {/* Phone Number Input */}
              <div className="mb-8">
                <label className="block font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-black transition"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter 10-15 digits without spaces or special characters
                </p>
              </div>

              {/* Status Message */}
              {updateStatus && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${updateStatus.includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : updateStatus.includes("Failed") || updateStatus.includes("Please") || updateStatus.includes("valid")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                  {updateStatus.includes("success") ? (
                    <Check className="w-5 h-5" />
                  ) : updateStatus.includes("Failed") || updateStatus.includes("Please") || updateStatus.includes("valid") ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : null}
                  <p className="font-medium">{updateStatus}</p>
                </div>
              )}

              {/* Update Button */}
              <button
                onClick={UpdateData}
                disabled={!number.trim() || isUpdating}
                className={`w-full py-4 rounded-lg font-semibold transition shadow-md ${!number.trim() || isUpdating
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                {isUpdating ? "Updating..." : "Update Phone Number"}
              </button>

              {/* Warning Box */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> You may need to verify this number before it can be used.
                    A verification code will be sent to the new number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default UpdateNumber;
