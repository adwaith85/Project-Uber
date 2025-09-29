import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './PAGES/Login'
import Location from './Components/Location'
import Home from './PAGES/Home'


createRoot(document.getElementById('root')).render(
  <StrictMode>
  {/* <Login/> */}
  {/* <Location/> */}
  <Home/>
  </StrictMode>,
)
