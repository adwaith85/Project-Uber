import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../api/AxiosClient.js"; // your axios instance
import DriverStore from "../Store/DriverStore.js";

function Register() {
  const nameRef = useRef("");
  const emailRef = useRef("");
  const numberRef = useRef("");
  const passwordRef = useRef("");
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // error/success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await Api.post("/driverregister", {
        name: nameRef.current.value,
        email: emailRef.current.value,
        number: numberRef.current.value,
        password: passwordRef.current.value,
      });
      if(response.data){
        alert("Registration successfull")
        navigate("/Login"); // redirect to dashboard
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 hover:shadow-gray-800">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Sign up to start driving
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              required
            />
          </div>

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

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              ref={numberRef}
              type="tel"
              placeholder="Enter your phone number"
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
            Register
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/Login")}
            className="text-white hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
