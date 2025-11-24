import React from "react";
import {
  CloudArrowDownIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../Components/Navbar"

function Supportpage() {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">

      {/* HEADER */}
      <header className="bg-white shadow-md sticky">
        <Navbar />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow px-4 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* CARD 1 - Download Drivers */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <CloudArrowDownIcon className="h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">Download Drivers</h2>
            <p className="text-gray-600 mt-2">
              Find and download the latest drivers for your operating system and device.
            </p>
            <div className="mt-4 text-blue-700 font-medium hover:underline cursor-pointer">
              View available drivers →
            </div>
          </div>

          {/* CARD 2 - Troubleshooting */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <WrenchScrewdriverIcon className="h-12 w-12 text-green-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">Troubleshooting</h2>
            <p className="text-gray-600 mt-2">
              Find solutions for common driver issues and step-by-step guidance.
            </p>
            <div className="mt-4 text-green-700 font-medium hover:underline cursor-pointer">
              Start troubleshooting →
            </div>
          </div>

          {/* CARD 3 - FAQs */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <QuestionMarkCircleIcon className="h-12 w-12 text-purple-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">FAQs</h2>
            <p className="text-gray-600 mt-2">
              Frequently asked questions about installation, updates, and driver errors.
            </p>
            <div className="mt-4 text-purple-700 font-medium hover:underline cursor-pointer">
              Read FAQs →
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-200 py-8 mt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold">About Support</h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              We provide driver downloads, troubleshooting help, and device support for all users.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="mt-3 space-y-2 text-gray-300">
              <p className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5" /> support@example.com
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5" /> +1 (800) 123-4567
              </p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-3 space-x-4 text-gray-300">
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
            </div>
          </div>

        </div>

        <div className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Driver Support. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Supportpage;
