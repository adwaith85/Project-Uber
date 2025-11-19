import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./PAGES/Home";
import Navbar from "./Components/Navbar";
import Profile from "./Components/Profile";
import Login from "./PAGES/Login";
import Register from "./PAGES/Register";
import UpdateProfile from "./Components/UpdateProfile";
import UpdateName from "./Components/UpdateName";
import UpdateNumber from "./Components/UpdateNumber";
import DriverStore from "./Store/DriverStore";
import Logouterror from "../../frontend/src/Components/Logouterror";
import UpdateCartype from "./Components/UpdateCartype";
import RidingLocation from "./Components/RidingLocation";
import DriverDestination from "./PAGES/DriverDestination";
import AllRideDetails from "./Components/AllRideDetails";
import RideAnalyticsChart from "./Components/RideAnalyticsChart";

function CustomRoute() {
    const token=DriverStore((state)=>state.token)
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/home" element={token?(<Home />):<Logouterror/>} />
                <Route path="/Navbar" element={token?(<Navbar />):<Logouterror/>} />
                <Route path="/Profile" element={token?(<Profile />):<Logouterror/>} />
                <Route path="/UpdateProfile" element={token?(<UpdateProfile />):<Logouterror/>} />
                <Route path="/UpdateName" element={token?(<UpdateName />):<Logouterror/>} />
                <Route path="/UpdateNumber" element={token?(<UpdateNumber />):<Logouterror/>} />
                <Route path="/updatecartype" element={token?(<UpdateCartype/>):<Logouterror/>} />
                <Route path="/ridinglocation" element={token?(<RidingLocation />):<Logouterror/>} />
                <Route path="/driverdestination" element={token?(<DriverDestination />):<Logouterror/>} />
                <Route path="/allridedetails" element={token?(<AllRideDetails />):<Logouterror/>} />
                <Route path="/rideanalyticschart" element={token?(<RideAnalyticsChart />):<Logouterror/>} />
                
            </Routes>
        </BrowserRouter>
    </>
}

export default CustomRoute