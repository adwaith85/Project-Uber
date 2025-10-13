import React, { useEffect, useState } from 'react'
import api from "../Api/Axiosclient"
import UserStore from '../Store/UserStore'
function UpdateForm() {
    const [firstname, setFirstName] = useState("")
    const [lastname, setLastName] = useState("")
    const {token} = UserStore()
    console.log(token)
    const UpdateData = async () => {
        try {
            const name = `${firstname} ${lastname}`.trim()
            const response = await api.post(
                '/updateuser',
                { name }, // shorthand for { name: name }
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.log(error)
        }
    }

    return (

        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow font-sans">
            <h2 className="text-2xl font-bold mb-2">Name</h2>
            <p className="text-gray-600 mb-6">
                This is the name you would like other people to use when referring to
                you.
            </p>

            {/* First Name */}
            <div className="mb-4">
                <label className="block font-semibold mb-1"> Name</label>
                <div className="relative">
                    <input
                        type="text"
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none"
                    />
                    <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
                    >
                        &#x2715;
                    </button>

                </div>
            </div>

            {/* Last Name */}
            <div className="mb-6">
                <label className="block font-semibold mb-1">Last name</label>
                <div className="relative">
                    <input
                        type="text"
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none"
                    />
                    <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
                    >
                        &#x2715;
                    </button>
                </div>
            </div>

            {/* Update Button */}
            <button
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
                onClick={UpdateData}
            >
                Update
            </button>
        </div>

    )
}

export default UpdateForm