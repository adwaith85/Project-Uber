import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Rider() {
  const navigate = useNavigate();

  // ⏳ Auto navigate after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1); // Go back to the previous page
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white overflow-hidden relative">
      {/* Floating Emojis */}
      <motion.div
        className="absolute text-6xl top-10 left-10"
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🚗
      </motion.div>
      <motion.div
        className="absolute text-6xl bottom-16 right-12"
        animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        🌈
      </motion.div>
      <motion.div
        className="absolute text-5xl top-24 right-20"
        animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ✨
      </motion.div>

      {/* Center Animated Text Card */}
      <motion.div
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl px-10 py-8 shadow-2xl flex flex-col items-center justify-center text-center"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-3 text-white drop-shadow-lg"
        >
          👋 Bye Bye Rider!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg md:text-xl text-white/90"
        >
          Hope to see you again soon! 💖✨
        </motion.p>

        {/* Cute bouncing emoji */}
        <motion.div
          className="text-6xl mt-6"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          😎🚀💫
        </motion.div>

        {/* Countdown text */}
        <motion.p
          className="mt-4 text-sm text-white/80"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Redirecting back in 10 seconds ⏳
        </motion.p>
      </motion.div>

      {/* Background animated confetti dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white opacity-50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 10, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Rider;
