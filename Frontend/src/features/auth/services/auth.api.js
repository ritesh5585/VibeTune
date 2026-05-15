import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    withCredentials: true,
});

// Har request mein token attach karo automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function register({ username, email, password }) {
    const response = await api.post("/api/auth/register", {
        username,
        email,
        password,
    });
    return response.data;
}

export async function login({ email, password }) {
    
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
}

export async function logOut() {
    const response = await api.post("/api/auth/logout"); // GET → POST
    return response.data;
}

export async function getMe() {
    const response = await api.get("/api/auth/getme");
    return response.data;
}