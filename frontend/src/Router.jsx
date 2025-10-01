import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./PAGES/Login";
import Home from "./PAGES/Home";

function CustomRoute(){
    return<>
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Login" element={<Login/>}/>
    </Routes>
    </BrowserRouter>
    </>
}

export default CustomRoute