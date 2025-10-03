import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./PAGES/Login";
import Home from "./PAGES/Home";
import BookRide from "./Components/BookRide";
import NavbarX from "./Components/NavbarX";
import UserHome from "./PAGES/UserHome";
import Suggestions from "./Components/Suggestions";

function CustomRoute() {
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/BookRide" element={<BookRide />} />
                <Route path="/NavbarX" element={<NavbarX />} />
                <Route path="/UserHome" element={<UserHome/>} />
                
            </Routes>
        </BrowserRouter>
    </>
}

export default CustomRoute