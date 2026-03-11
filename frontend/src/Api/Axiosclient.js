import axios from "axios";
import UserStore from "../Store/UserStore";

const api = axios.create({
    // baseURL: "http://localhost:8080",
    baseURL: "https://uber-api.adwaithh.online",
})

// Add an interceptor to include the token in every request
api.interceptors.request.use(
    (config) => {
        const token = UserStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

