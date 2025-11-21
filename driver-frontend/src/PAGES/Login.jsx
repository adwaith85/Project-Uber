import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DriverStore from "../Store/DriverStore"; 
import api from "../api/axiosClient";

function Login() {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const addToken = DriverStore((state) => state.addToken);
  const addUser = DriverStore((state) => state.addUser);
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // message for success/error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // clear previous message

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
        }
      },
      (error) => {
        console.error("geolocation error", error)
      }
    )

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 hover:shadow-gray-800">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Sign in to continue driving
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              ref={emailRef}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              required
            />
          </div>

          {/* Message */}
          {message && (
            <p className="text-red-500 text-sm mt-2">{message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-300 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Extra Links */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-white hover:underline"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
