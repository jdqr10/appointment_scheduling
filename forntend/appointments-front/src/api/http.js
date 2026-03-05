import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// Attach access token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    if (status !== 401 || original?._retry) return Promise.reject(err);

    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    if (!refreshToken) return Promise.reject(err);

    if (isRefreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject })).then(() => http(original));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const r = await axios.post(
        (import.meta.env.VITE_API_BASE_URL || "/api") + "/auth/refresh",
        { refreshToken }
      );

      localStorage.setItem("ACCESS_TOKEN", r.data.accessToken);
      if (r.data.refreshToken) localStorage.setItem("REFRESH_TOKEN", r.data.refreshToken);

      processQueue(null, r.data.accessToken);
      return http(original);
    } catch (e) {
      processQueue(e, null);
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
