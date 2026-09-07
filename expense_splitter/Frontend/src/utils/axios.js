import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

api.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();

    if (["post", "put", "patch", "delete"].includes(method)) {
        await api.get("/api/csrf");

        const csrfToken = document.cookie
            .split("; ")
            .find(row => row.startsWith("csrftoken="))
            ?.split("=")[1];

        if (csrfToken) {
            config.headers["X-CSRFToken"] = csrfToken;
        }
    }

    return config;
});

export default api;