import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './PAGES/Login'
import Location from './Components/Location'
import Home from './PAGES/Home'
import CustomRoute from './Router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomRoute/>
  {/* <Login/> */}
  {/* <Location/> */}
  {/* <Home/> */}
  </StrictMode>,
)
