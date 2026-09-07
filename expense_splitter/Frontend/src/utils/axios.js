import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

let csrfToken = null;

const initializeCsrf = async () => {
    const response = await api.get("/api/csrf");

    csrfToken =
        response.data?.csrfToken ||
        response.headers["x-csrftoken"] ||
        null;
};

api.interceptors.request.use(
    async (config) => {
        const method = config.method?.toLowerCase();

        if (
            ["post", "put", "patch", "delete"].includes(method) &&
            !config.url?.includes("/api/csrf")
        ) {
            if (!csrfToken) {
                await initializeCsrf();
            }

            if (csrfToken) {
                config.headers = config.headers || {};
                config.headers["X-CSRFToken"] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;