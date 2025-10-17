import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./PAGES/Home";
import Navbar from "./Components/Navbar";
import Profile from "./Components/Profile";
import Login from "./PAGES/Login";
import Register from "./PAGES/Register";

function CustomRoute() {
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Navbar" element={<Navbar />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    </>
}

export default CustomRoute