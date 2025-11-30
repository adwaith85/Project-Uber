import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/Axiosclient";
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

function Register() {
  const nameRef = useRef("");
  const emailRef = useRef("");
  const numberRef = useRef("");
  const passwordRef = useRef("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/register", {
        name: nameRef.current.value,
        email: emailRef.current.value,
        password: passwordRef.current.value,
        number: numberRef.current.value,
      });
      console.log("Registered:", response.data);
      alert("Registration successful!");
      navigate("/Login");
    } catch (error) {
      console.error("Error registering:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-50 pt-[70px]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-8 bg-white rounded-2xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">Create Your Account</h2>

          <input
            type="text"
            placeholder="Full Name"
            ref={nameRef}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
            required
          />

          <input
            type="email"
            placeholder="Email"
            ref={emailRef}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
            required
          />

          <input
            type="number"
            placeholder="Phone Number"
            ref={numberRef}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            ref={passwordRef}
            className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/Login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Register;
