import NavbarX from '../Components/NavbarX'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import CurrentLocationMap from '../Components/CurrentLocationMap'
import { useMutation } from "@tanstack/react-query"
import UserStore from '../Store/UserStore'
import api from '../Api/Axiosclient'
import { useEffect } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'


function UserHome() {
  const token = UserStore((state) => state.token)
  const locationMutation = useMutation({
    mutationFn: async (formdata) => {
      return await api.put("/locationupdate", formdata, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onSuccess: () => {
      console.log("location updated successfully")
    },
    onError: (error) => {
      console.error("error updating location", error.message)
    },
  })

  const updateLocation = () => {
    if (!navigator.geolocation) {
      console.warn("geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        }
        locationMutation.mutate({ location })
      },
      (error) => {
        console.error("failed to get location", error)
      }
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateLocation()
    }, 10000);
    return () => clearInterval(interval);
  }, []);


  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey:"AIzaSyAckZqFHLtXwxQuaIrxkByBZTq2XUqywNg",
    libraries: ["places"],
  });


  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading Maps...</p>;


  return (<>
    <div>
      <div className='relative z-10'>
        <NavbarX />
      </div>
      <div className=''>
        <div className="p-5 m-2 -mt-3 h-1/4 bg-white  ">
          <h1 className="  text-[2rem] font-semibold">Get ready to your first trip😊</h1>
          <p className='-mb-4 mt-4 text-sm'>Discovery the convenience of the request a ride now , or schedule one for later directly from your browser</p>
        </div>
        <Location />
        <Link to="/BookRide">
          <button className='border rounded-xl p-3 bg-black text-md text-white ml-6 mt-3 h-12 w-36'>See Prices</button>
        </Link>
      </div>
      <div className="">
        <CurrentLocationMap />
      </div>
      <div className='w-90% h-100 bg-blue-400 mt-5'></div>
      <div>
        <Suggestions />
      </div>

    </div>

  </>)
}

export default UserHome