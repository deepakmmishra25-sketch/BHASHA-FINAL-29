import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor ΓÇö attach auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const authData = localStorage.getItem("bhashasetu-auth");
const token = authData ? JSON.parse(authData)?.accessToken : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor ΓÇö handle 401 refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const existing = JSON.parse(localStorage.getItem("bhashasetu-auth") || "{}");
localStorage.setItem("bhashasetu-auth", JSON.stringify({...existing, accessToken: data.access_token}));
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(original);
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
