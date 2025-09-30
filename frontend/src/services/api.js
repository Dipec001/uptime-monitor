import axios from "axios";

// set your backend base URL
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // remove hardcoded part later
});

// Request interceptor: attach access token automatically
API.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: refresh token if 401
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        // Refresh token expired → log out user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;



// login function
export async function login(email, password) {
  const response = await API.post("login/", { email, password });
  console.log(response.data)
  return response.data; // this will have {access, refresh}
}

// register function
export async function register(email, password) {
  const response = await API.post("register/", { email, password });
  return response.data;
}


export async function refreshToken(token) {
  const response = await API.post("token/refresh/", { token });
  return response.data;
}


export async function resetPasswordConfirm(uid, token, new_password) {
  const response = await API.post("reset-password/", {
    uid,
    token,
    new_password,
  });
  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await API.post("forgot-password/", { email });
  return response.data;
}

export function isLoggedIn() {
    // Check if access token exists in localStorage
  return !!localStorage.getItem("access_token");
}

export function logout() {
    // Remove tokens from localStorage
    console.log("Logging out...");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// Website APIs
export const fetchWebsites = () => API.get("websites/");
export const createWebsite = (data) => API.post("websites/", data);
export const fetchWebsite = (id) => API.get(`websites/${id}/`);
export const updateWebsite = (id, data) => API.put(`websites/${id}/`, data);
export const deleteWebsite = (id) => API.delete(`websites/${id}/`);

// Heartbeat APIs
export const fetchHeartbeats = () => API.get("heartbeats/");
export const fetchHeartbeat = (id) => API.get(`heartbeats/${id}/`);
export const createHeartbeat = (id, data) => API.post(`heartbeats/${id}/`, data);
export const deleteHeartbeat = (id) => API.delete(`heartbeats/${id}/`);
export const updateHeartbeat = (id, data) => API.put(`heartbeats/${id}/`, data);