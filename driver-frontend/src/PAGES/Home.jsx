import React, { use, useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import CurrentLocationMap from "../Components/CurrentLocationMap";
import DriverStore from "../Store/DriverStore";
import RiderReqMessage from "../Components/RiderReqMessage";
import { io } from "socket.io-client";
import AllRideDetails from "../Components/AllRideDetails";

function Home() {
  const socketRef = useRef(null);
  const [ridenotify, Setridenotify] = useState(false)
  const [rideData, SetrideData] = useState({})

  const token = DriverStore((state) => state.token)

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", { transports: ["websocket"] });
    socketRef.current.on("connect", () => {
      console.log("🚗 Connected:", socketRef.current.id);
    });

    // 🚨 Ride request received
    socketRef.current.on("ride:alert", (msg) => {

      console.log("ride request", msg)
      SetrideData(msg)
      Setridenotify(true)
      setTimeout(() => {
        Setridenotify(false)
      }, 25000)

    });

    return () => socketRef.current.disconnect();
  }, []);


  return (<>
    <div className="flex flex-col bg-gray-100 text-gray-900">
      <Navbar />
      <main className="flex-1 overflow-y-auto md:ml-70 p-3 space-y-6 ">
        <div className="w-[100%] ">
          <CurrentLocationMap socketRef={socketRef} />
        </div>
        <div className="w-full bottom-7">
          {ridenotify ? (
            <RiderReqMessage ride={rideData} socketRef={socketRef} />
          ) : (
            <></>
          )}
        </div>
      </main>
          
    </div>
    <div className="relative bg-gray-100 w-full  h-[80%] md:w-[100%] mx-auto mb-10 rounded-xl shadow-lg overflow-hidden">
          <AllRideDetails/>
          </div>
  </>);
}

export default Home;