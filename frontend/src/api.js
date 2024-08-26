import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// 
// const apiUrl = "http://localhost:8000";
const apiUrl = "https://r8oo8c8sc8c8kko04s4w0ckw.desync-game.com";
// 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
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