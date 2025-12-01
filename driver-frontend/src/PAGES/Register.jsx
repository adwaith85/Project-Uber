import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import DriverStore from "../Store/DriverStore.js";
import api from "../API/AxiosClient.js";

function Register() {
  const nameRef = useRef("");
  const emailRef = useRef("");
  const numberRef = useRef("");
  const passwordRef = useRef("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // error/success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/driverregister", {
        name: nameRef.current.value,
        email: emailRef.current.value,
        number: numberRef.current.value,
        password: passwordRef.current.value,
      });
      if (response.data) {
        setMessage("✓ Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-orange-400 transition"
        >
          ← Back to Home
        </button>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-800 hover:border-orange-500/50 transition">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Join DriveEarn</h1>
            <p className="text-gray-400">Start your driving journey today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Your full name"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                <input
                  ref={numberRef}
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg ${message.includes("success") ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50"}`}>
                <p className={message.includes("success") ? "text-green-400 text-sm" : "text-red-400 text-sm"}>{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">Already a member?</span>
            </div>
          </div>

          {/* Login Link */}
          <button
            onClick={() => navigate("/login")}
            className="w-full border-2 border-orange-400 text-orange-400 font-bold py-3 rounded-lg hover:bg-orange-400/10 transition"
          >
            Login to Account
          </button>

          {/* Footer with Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-xs font-semibold mb-3">Why join us?</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Flexible working hours
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Instant earnings tracking
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                24/7 customer support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
