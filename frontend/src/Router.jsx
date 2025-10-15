import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./PAGES/Login";
import Home from "./PAGES/Home";
import BookRide from "./Components/BookRide";
import NavbarX from "./Components/NavbarX";
import UserHome from "./PAGES/UserHome";
import Suggestions from "./Components/Suggestions";
import AccountManager from "./PAGES/AccountManager";
import PersonalInfo from "./Components/PersonalInfo";
import Register from "./PAGES/Register";
import UpdateForm from "./Components/UpdateForm";
import ProfileUpdate from "./Components/ProfileUpdate";
import UpdateNumber from "./Components/UpdateNumber";

function CustomRoute() {
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/BookRide" element={<BookRide />} />
                <Route path="/NavbarX" element={<NavbarX />} />
                <Route path="/UserHome" element={<UserHome />} />
                <Route path="/AccountManager" element={<AccountManager />} />
                <Route path="/PersonalInfo" element={<PersonalInfo />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/UpdateForm" element={<UpdateForm />} />
                <Route path="/ProfileUpdate" element={<ProfileUpdate />} />
                <Route path="/UpdateNumber" element={<UpdateNumber />} />
            </Routes>
        </BrowserRouter>
    </>
}

export default CustomRoute