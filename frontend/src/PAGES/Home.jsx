import React from 'react'
import Navbar from '../Components/Navbar'
import Location from '../Components/Location'

function Home() {
    return (<>
        <Navbar />
         <div className="p-5  h-1/4 bg-white flex items-center ">
            <h1 className=" m-3 text-[2.4rem] font-semibold">Go anywhere with Uber</h1>
        </div>
        <Location />
        <div className="p-5 -ml-4">
                <button className='border rounded-xl bg-black text-m text-white ml-5  h-12 w-36'>See prices</button>
                <button className='ml-10 underline underline-offset-8'>log in to see your recent activity</button>
            </div>
        <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Suggestions</h2>

      <div className="flex flex-col gap-6">
        
        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Ride</h4>
            <p className="text-gray-700 text-[13px] mb-4">Go anywhere with Uber. Request a ride, hop in, and go.</p>
            <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button>
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDOb9UfTmRb_7N70tjlP_aHR75pZNMk-S6zQ&s" alt="" className="w-28  md:w-32" />
          </div>
        </div>

        
        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Reserve</h4>
            <p className="text-gray-700 text-[13px] mb-4">Reserve your ride in advance so you can relax on the day of your trip.</p>
            <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button>
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz0F1sb1B9Wka-3vPtjLGY0mgurj25OZ2iZQ&s" alt="" className="w-28  md:w-32" />
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Intercity</h4>
            <p className="text-gray-700 text-[13px] mb-4">Get convenient, affordable outstation cabs anytime at your door.</p>
            <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button>
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJCh_Wvpa8MlqQFLiiAVuHZM7VnHhdXTMdUg&s" alt="" className="w-28 md:w-32" />
          </div>
        </div>
        <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl ">
          <div>
            <h4 className="text-lg font-semibold mb-2">Rentals</h4>
            <p className="text-gray-700 text-[13px] mb-4">Request a trip for a block of time and make multiple stops.</p>
            <button className="bg-white hover:bg-gray-100 px-6 py-2 rounded-full font-medium  text-black">Details</button>
          </div>
          <div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8UvILwn5zKTncD56waPTACFufw9d_BRNqTw&s" alt="" className="w-28 md:w-32" />
          </div>
        </div>
      </div>
    </div>

        <div className="max-w-xl mx-auto text-center py-12 ">
      
      <h2 className="text-[25px] -ml-10 font-bold mb-4">
        Log in to see your account details
      </h2>

     
      <p className="text-md ml-[19px] m-7 mt-3  text-gray-600 mb-8">
        View past trips, tailored suggestions, support resources, and more.
      </p>

      
      <div className="-ml-14 flex items-center justify-center gap-6">
        <button className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition">
          Log in to your account
        </button>
        <button className="text-black text-lg font-medium border-b border-gray-400 hover:border-black transition">
          Create an account
        </button>
      </div>
    </div>
    <div className="flex items-center justify-center ">
  <img
    src="https://tb-static.uber.com/prod/udam-assets/850e6b6d-a29e-4960-bcab-46de99547d24.svg"
    alt="example"
    className="w-200 p-5 -mt-5"
  />
</div>

    </>)
}

export default Home