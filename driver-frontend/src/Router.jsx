import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./PAGES/Home";

function CustomRoute() {
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    </>
}

export default CustomRoute