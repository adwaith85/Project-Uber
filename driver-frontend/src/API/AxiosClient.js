import axios from "axios";

const api = axios.create({
    // baseURL: "http://localhost:8080",
    baseURL: "https://uber-api.adwaithh.online",

})

export default api;
