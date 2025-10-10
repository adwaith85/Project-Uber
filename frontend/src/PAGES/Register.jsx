import api from '../Api/Axiosclient';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom'
function Register() {
  const EmailRef = useRef("")

  const NameRef = useRef("")
  const NumberRef = useRef("")
  const PasswordRef = useRef("")
  // const nav=useNavigate()
  const OnSubmit = async (e) => {
    try {
      e.preventDefault()
      const response = await api.post("/register", {
        name: NameRef.current.value,
        email: EmailRef.current.value,
        password: PasswordRef.current.value,
        number: NumberRef.current.value,
      })
      console.log("registered", response.data)

    } catch (error) {
      console.log("error:", error.response?.data || error.message)
    }
  }

  return (<>
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="flex flex-col gap-4 p-6 border border-gray-300 bg-white rounded shadow-md w-full max-w-sm"
        onSubmit={OnSubmit}
      >
        <h2 className="text-center text-xl font-semibold text-gray-700">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ref={NameRef}
        />
        <input
          type="text"
          placeholder="Email"
          className="p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ref={EmailRef}
        />
        <input
          type="number"
          placeholder="Number"
          className="p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ref={NumberRef}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ref={PasswordRef}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"

        >
          SUBMIT
        </button>
      </form>
    </div>
  </>);
}

export default Register;