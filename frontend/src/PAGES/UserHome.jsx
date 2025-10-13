import NavbarX from '../Components/NavbarX'
import Location from '../Components/Location'
import { Link } from "react-router-dom"
import Suggestions from '../Components/Suggestions'
import UserStore from '../Store/UserStore'
import { useEffect, useState } from 'react'
import api from '../Api/Axiosclient'

function UserHome() {
  const [userdata, SetUsrData] = useState({})
    const adduser=UserStore((state)=>state.adduser)
    const user=UserStore((state)=>state.user)
    const { token } = UserStore()
    const Onsubmit = async () => {
        try {
            const response = await api.get("/GetDetails", {
                headers: {
                    Authorization: `Bearer ${token}`  // ✅ Important
                }
            })
            console.log(response.data)

            SetUsrData(response.data)
            adduser(response.data)
        } catch (error) {
            res.send(error)
        }
    }
    useEffect(() => {
        Onsubmit()
    }, [])
  return (<>
    <div>
        <div className='relative z-10'>
            <NavbarX/>
        </div>
        <div className=''>
            <div className="p-5 m-2 -mt-3 h-1/4 bg-white  ">
            <h1 className="  text-[2rem] font-semibold">Get ready to your first trip😊</h1>
            <p className='-mb-4 mt-4 text-sm'>Discovery the convenience of the request a ride now , or schedule one for later directly from your browser</p>
        </div>
            <Location/>
            <Link to="/BookRide"> 
            <button className='border rounded-xl p-3 bg-black text-md text-white ml-6 mt-3 h-12 w-36'>See Prices</button>
            </Link>
        </div>
        <div className='w-90% h-100 bg-blue-400 mt-5'></div>
        <div>
           <Suggestions/>
        </div>
    </div>
    
  </>)
}

export default UserHome