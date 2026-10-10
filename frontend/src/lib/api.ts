import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AUTH_KEY = "bhashasetu-auth";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

function readAuthState() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "{}")?.state ?? null;
  } catch {
    return null;
  }
}

// Attach the access token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = readAuthState()?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401: try the refresh token once. If that fails, clear the login and go to /login once.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry || typeof window === "undefined") {
      return Promise.reject(error);
    }
    original._retry = true;

    const refreshToken = readAuthState()?.refreshToken;
    if (refreshToken) {
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const existing = JSON.parse(localStorage.getItem(AUTH_KEY) || "{}");
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            ...existing,
            state: { ...existing.state, accessToken: data.access_token },
          })
        );
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(original);
      } catch {
        // Refresh failed. Fall through and clear the login below.
      }
    }

    // Login is no longer valid: clear it and go to the login page once (no reload loop)
    localStorage.removeItem(AUTH_KEY);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
