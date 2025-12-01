import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import DriverStore from "../Store/DriverStore";
import api from "../API/AxiosClient";

function Login() {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const addToken = DriverStore((state) => state.addToken);
  const addUser = DriverStore((state) => state.addUser);
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // message for success/error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        }
        try {
          const response = await api.post(
            "/driverlogin",
            JSON.stringify({
              email: emailRef.current?.value,
              password: passwordRef.current?.value,
              location: location,
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log(response.data.token)
          if (response.data.token) {
            addToken(response.data.token); // store token

            // Fetch driver details after login
            try {
              const detailsRes = await api.get('/Details', {
                headers: { Authorization: `Bearer ${response.data.token}` },
              });
              addUser(detailsRes.data); // store user details including _id
            } catch (err) {
              console.error("Error fetching driver details:", err);
            }

            navigate("/home"); // redirect to dashboard
          } else {
            setMessage("Login failed. Please check your credentials.");
          }
        } catch (error) {
          setMessage(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("geolocation error", error)
        setLoading(false);
      }
    )

  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80  rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-orange-900 transition"
        >
          ← Back to Home
        </button>

        {/* Card */}
        <div className="bg-gray-700 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-800 hover:border-orange-500/50 transition">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-200 rounded-xl mb-4">
              <span className="text-2xl">🚗</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Welcome Back</h1>
            <p className="text-gray-200">Sign in to your driver account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-500" />
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-900 focus:border-transparent transition"
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
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-900 focus:border-transparent transition"
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

            {/* Error Message */}
            {message && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-300 to-blue-300 text-blue font-bold py-3 rounded-lg hover:shadow-md hover:shadow-orange-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  Login to Dashboard
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
            <div className="relative flex justify-center text-sm ">
              <span className="rounded-md px-4 bg-gray-800 text-gray-500">New to DriveEarn?</span>
            </div>
          </div>

          {/* Register Link */}
          <button
            onClick={() => navigate("/register")}
            className="w-full border-2 border-orange-100 text-red-500 font-bold py-3 rounded-lg hover:bg-orange-400/10 transition"
          >
            Create Account
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-gray-300 text-xs">
            <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
