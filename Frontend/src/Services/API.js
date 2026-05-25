import axios from "axios";

// frontend and backend connection with axios
export const apiRequest = axios.create({
	baseURL: "https://foodie-dash-backend.onrender.com/api",
	withCredentials: true,
});

// Google auth function (POST)
export const googleAuth = (code) => apiRequest.post("/auth/google", { code });

export const imgBaseURL = "https://foodie-dash-backend.onrender.com";
