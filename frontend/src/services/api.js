// src/services/Api.js
import axios from "axios";

// Get base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

// Create axios instance
const API = axios.create({
  baseURL: BASE_URL,
});

// ============================================
// INTERCEPTORS
// ============================================

// Request interceptor: attach access token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh token if 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post(`${BASE_URL}/token/refresh/`, {
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

// ============================================
// AUTH APIs
// ============================================

export const login = async (email, password, rememberMe) => {
  try {
    const response = await API.post("login/", { email, password, remember_me: rememberMe, });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.detail || 
      "Login failed"
    );
  }
};

export const register = async (fullName, email, password) => {
  try {
    const response = await API.post("register/", {
      full_name: fullName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.detail || 
      "Registration failed"
    );
  }
};

export const socialAuth = async (provider, accessToken) => {
  try {
    const response = await API.post("auth/social/", {
      provider,
      access_token: accessToken,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.detail || 
      "Social authentication failed"
    );
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post("forgot-password/", { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      "Password reset request failed"
    );
  }
};

export const resetPasswordConfirm = async (uid, token, newPassword) => {
  try {
    const response = await API.post("reset-password/", {
      uid,
      token,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      "Password reset failed"
    );
  }
};

export const logout = () => {
  console.log("Logging out...");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};

// ============================================
// WEBSITE APIs
// ============================================

export const fetchWebsites = async () => {
  try {
    const response = await API.get("websites/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch websites");
  }
};

export const createWebsite = async (data) => {
  try {
    const response = await API.post("websites/", data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create website");
  }
};

export const fetchWebsite = async (id) => {
  try {
    const response = await API.get(`websites/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch website");
  }
};

export const updateWebsite = async (id, data) => {
  try {
    const response = await API.put(`websites/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update website");
  }
};

export const deleteWebsite = async (id) => {
  try {
    const response = await API.delete(`websites/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete website");
  }
};

// ============================================
// HEARTBEAT APIs
// ============================================

export const fetchHeartbeats = async () => {
  try {
    const response = await API.get("heartbeats/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch heartbeats");
  }
};

export const fetchHeartbeat = async (id) => {
  try {
    const response = await API.get(`heartbeats/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch heartbeat");
  }
};

export const createHeartbeat = async (id, data) => {
  try {
    const response = await API.post(`heartbeats/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create heartbeat");
  }
};

export const updateHeartbeat = async (id, data) => {
  try {
    const response = await API.put(`heartbeats/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update heartbeat");
  }
};

export const deleteHeartbeat = async (id) => {
  try {
    const response = await API.delete(`heartbeats/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete heartbeat");
  }
};

export const createBulkWebsites = async (websites) => {
  try {
    const response = await API.post("websites/bulk_create/", { websites });
    return response.data;
  } catch (error) {
    throw new Error("Failed to create websites in bulk");
  }
};

export default API;