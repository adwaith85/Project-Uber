import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, MapPin, Users, TrendingUp, Shield, Clock } from "lucide-react";
import CurrentLocationMap from "../Components/CurrentLocationMap"

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Track your rides in real-time with live GPS updates",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Earnings Analytics",
      description: "Monitor your daily, monthly, and yearly earnings with detailed charts",
      color: "from-green-400 to-green-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Easy Ride Management",
      description: "Accept or decline rides with a single tap",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Notifications",
      description: "Get instant alerts for new ride requests",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Safe and secure payment processing for every ride",
      color: "from-red-400 to-red-600",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support and assistance",
      color: "from-indigo-400 to-indigo-600",
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Drivers" },
    { number: "2M+", label: "Rides Completed" },
    { number: "₹100Cr+", label: "Total Earnings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-200 to-orange-300 rounded-full flex items-center justify-center font-bold text-lg">
            🚗
          </div>
          <span className="text-2xl font-bold bg-orange-600 bg-clip-text text-transparent">
            DriveEarn
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 text-black hover:text-orange-700 transition font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2 bg-orange-300 rounded-lg font-semibold hover:shadow-md hover:shadow-orange-500/50 transition transform hover:scale-105"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Start Earning
            <br />
            <span className="bg-red-500 to-pink-500 bg-clip-text text-transparent">
              On Your Terms
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of drivers earning flexible income. Drive when you want, earn what you deserve with real-time tracking and instant payouts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 md:px-10 md:py-4 bg-orange-900 text-white font-bold rounded-lg hover:shadow-md hover:shadow-orange-500/50 transition transform hover:scale-105 text-lg"
            >
              Login to Dashboard
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 md:px-10 md:py-4 border-2 border-orange-600 text-orange-900 font-bold rounded-lg hover:bg-orange-100 transition text-lg"
            >
              Start as New Driver
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mb-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-orange-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="mb-16 md:mb-24">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-1 h-80 md:h-96 flex items-center justify-center border border-gray-700">
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
             <CurrentLocationMap/> {/* <div className="text-6xl md:text-8xl">🗺️</div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-1 md:py-2">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Why Choose
          <span className="bg-gradient-to-r from-orange-900 to-orange-600 bg-clip-text text-transparent"> DriveEarn?</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 md:mb-16 text-lg">
          Everything you need to maximize your earnings and manage your driving career
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 md:p-8 rounded-xl bg-gray-500 border border-gray-900 hover:border-orange-900 transition transform hover:scale-105 backdrop-blur-sm"
            >
              <div
                className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition`}
              >
                <div className="text-black">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-800 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="bg-gradient-to-r from-orange-600 to-red-800 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-lg mb-8 text-orange-50">
            Join our community of drivers and start earning today. Sign up in just 2 minutes!
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-3 md:py-4 bg-white text-orange-900 font-bold rounded-lg hover:shadow-xl transition transform hover:scale-105 text-lg"
          >
            Register Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900 mt-16 md:mt-24 py-8 md:py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center text-gray-700">
          <p className="mb-4">
            © 2024 DriveEarn. All rights reserved. Driving the future of transportation.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-orange-900 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-orange-900 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-orange-900 transition">
              Contact Us
            </a>
          </div>
        </div>
      </footer>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
