import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket once and keep it alive across navigation
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:8080", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on("connect", () => {
        console.log("🔗 Socket connected globally:", socketRef.current.id);
      });

      socketRef.current.on("disconnect", () => {
        console.log("🔗 Socket disconnected globally");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("🔗 Socket connection error:", error);
      });
    }

    return () => {
      // Don't disconnect on unmount; keep socket alive
      // socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
