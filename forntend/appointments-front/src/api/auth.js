import { http } from "./http";

export async function apiLogin({ email, password }) {
  const { data } = await http.post("/auth/login", { email, password });
  const accessToken = data.accessToken || data.token;
  if (!accessToken) {
    throw new Error("Login response does not include access token");
  }
  localStorage.setItem("ACCESS_TOKEN", accessToken);

  // Si ya implementaste refresh token:
  if (data.refreshToken) localStorage.setItem("REFRESH_TOKEN", data.refreshToken);

  return data;
}

export async function apiRegister(payload) {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function apiMe() {
  const { data } = await http.get("/auth/me");
  return data;
}

export async function apiLogout() {
  const refreshToken = localStorage.getItem("REFRESH_TOKEN");
  if (refreshToken) {
    try {
      await http.post("/auth/logout", { refreshToken });
    } catch {
      // ignore
    }
  }
  localStorage.removeItem("ACCESS_TOKEN");
  localStorage.removeItem("REFRESH_TOKEN");
}
