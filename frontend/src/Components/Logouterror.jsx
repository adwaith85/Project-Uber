import React from 'react';

function Logouterror() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center border border-red-200">
        <h2 className="text-3xl font-bold text-red-600 mb-4">NOT FOUND</h2>
        <p className="text-gray-700 mb-2">You're not logged in.</p>
        <p className="text-gray-600">Please login first to continue.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="mt-6 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
        >
          Please Login First
        </button>
      </div>
    </div>
  );
}

export default Logouterror;
