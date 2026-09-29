import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: apiBaseURL,
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

// Login, signup and logout are explicitly csrf_exempt in Django.
// Do not make a CSRF bootstrap request before these calls: a failed
// bootstrap should not prevent a user from reaching the auth endpoint.
const csrfExemptPaths = ["/login", "/signup", "/logout", "/api/csrf"];

api.interceptors.request.use(
    async (config) => {
        const method = config.method?.toLowerCase();
        const path = (config.url || "").split("?")[0];

        const needsCsrf =
            ["post", "put", "patch", "delete"].includes(method) &&
            !csrfExemptPaths.some((endpoint) => path === endpoint);

        if (needsCsrf) {
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
