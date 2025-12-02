import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./PAGES/Login";
import Home from "./PAGES/Home";
import BookRide from "./Components/BookRide";
import NavbarX from "./Components/NavbarX";
import UserHome from "./PAGES/UserHome";
import AccountManager from "./PAGES/AccountManager";
import PersonalInfo from "./Components/PersonalInfo";
import Register from "./PAGES/Register";
import UpdateForm from "./Components/UpdateForm";
import ProfileUpdate from "./Components/ProfileUpdate";
import UpdateNumber from "./Components/UpdateNumber";
import UserStore from "./Store/UserStore";
import Logouterror from "./Components/Logouterror";
import Rider from "./Components/Rider";
import RidingLocation from "./Components/RidingLocation";
import Destination from "./PAGES/Destination";
import RideHistory from "./PAGES/RideHistory";

function CustomRoute() {
    const token = UserStore((state) => state.token)
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/BookRide" element={<BookRide />} />
                <Route path="/NavbarX" element={token ? (<NavbarX />) : <Logouterror />} />
                <Route path="/UserHome" element={token ? (<UserHome />) : <Logouterror />} />
                <Route path="/AccountManager" element={token ? (<AccountManager />) : <Logouterror />} />
                <Route path="/PersonalInfo" element={token ? (<PersonalInfo />) : <Logouterror />} />
                <Route path="/UpdateForm" element={token ? (<UpdateForm />) : <Logouterror />} />
                <Route path="/ProfileUpdate" element={token ? (<ProfileUpdate />) : <Logouterror />} />
                <Route path="/UpdateNumber" element={token ? (<UpdateNumber />) : <Logouterror />} />
                <Route path="/rider" element={token ? (<Rider />) : <Logouterror />} />
                <Route path="/ridinglocation" element={token ? (<RidingLocation />) : <Logouterror />} />
                <Route path="/destination" element={token ? (<Destination />) : <Logouterror />} />
                <Route path="/ridehistory" element={token ? (<RideHistory />) : <Logouterror />} />
            </Routes>
        </BrowserRouter>
    </>
}

export default CustomRoute