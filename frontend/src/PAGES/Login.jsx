import React from 'react'
import Navbar from '../Components/Navbar'

function Login() {
  return (<>
  <Navbar/>
    <div className="w-[100%] h-[100vh]  ">
    <h2 className='text-4xl text-center p-[50px]  -mb-[40px] font-medium text-red-950 '>LOGIN</h2>
    <form action="" className="text-center rounded-xl p-8 shadow-[0_10px_39px_rgba(0,12,29,0.37)] backdrop-blur-md bg-[var(--color-surface)] border border-[rgba(27,164,0,0.18)]  gap-[20px] w-[70%] h-[30%] max-w-[28rem] my-8 mx-auto flex flex-col items-center">
        <input required className="rounded-[5px] text-center border user-valid:border-green-500"  type="text" placeholder='username' />
        <input required className="rounded-[5px] text-center border user-valid:border-green-500" type="text" placeholder='email/number' />
        <input required className="rounded-[5px] text-center border user-valid:border-green-500" type="text" placeholder='password' />
        <button className='text-md rounded-[5px] border bg-sky-500 hover:bg-sky-700'>SUBMIT</button>
    </form>

    </div>
  </>)
}

export default Login