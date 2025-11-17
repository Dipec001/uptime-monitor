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
    const response = await API.post("login/", { 
      email, 
      password, 
      remember_me: rememberMe 
    });
    return response.data;
  } catch (error) {
    // Handle different error response formats
    const errorData = error.response?.data;
    
    if (errorData) {
      // Check for non_field_errors (common in login)
      if (errorData.non_field_errors) {
        const message = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
        throw new Error(message);
      }
      
      // Check for field-specific errors
      if (errorData.email) {
        throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
      }
      if (errorData.password) {
        throw new Error(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
      }
      
      // Check for general error messages
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
    }
    
    // Fallback to generic message
    throw new Error("Login failed. Please try again.");
  }
};

export const register = async (email, password) => {
  try {
    const response = await API.post("register/", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // Handle different error response formats
    const errorData = error.response?.data;
    
    if (errorData) {
      // Check for field-specific errors (like email, password)
      if (errorData.email) {
        throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
      }
      if (errorData.password) {
        throw new Error(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
      }
      // Check for general error messages
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
      // If there's a non_field_errors array
      if (errorData.non_field_errors) {
        throw new Error(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
      }
    }
    
    // Fallback to generic message
    throw new Error("Registration failed. Please try again.");
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
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};

// User profile
export const getUserProfile = async () => {
  try {
    const response = await API.get("user/profile/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch user profile");
  }
};

// ============================================
// WEBSITE APIs
// ============================================

export const getWebsites = async () => {
  try {
    const response = await API.get("websites/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch websites");
  }
};

export const fetchWebsites = async () => {
  try {
    const response = await API.get("websites/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch websites");
  }
};

export const createWebsite = async (websiteData) => {
  try {
    const response = await API.post("websites/", websiteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create website monitor");
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
    throw new Error(error.response?.data?.detail || "Failed to delete website");
  }
};

// ✅ Get extended website detail
export const getWebsiteDetail = async (id) => {
  try {
    const response = await API.get(`websites/${id}/detail_view/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch website detail");
  }
};

// Keep your existing functions and add:
export const patchWebsite = async (id, data) => {
  try {
    const response = await API.patch(`websites/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update website");
  }
};
// ============================================
// HEARTBEAT APIs
// ============================================

export const getHeartbeats = async () => {
  try {
    const response = await API.get("heartbeats/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch heartbeats");
  }
};

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

export const createHeartbeat = async (heartbeatData) => {
  try {
    const response = await API.post("heartbeats/", heartbeatData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create heartbeat");
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
    throw new Error(error.response?.data?.detail || "Failed to delete heartbeat");
  }
};

// ✅ Get extended heartbeat detail
export const getHeartbeatDetail = async (id) => {
  try {
    const response = await API.get(`heartbeats/${id}/detail_view/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch heartbeat detail");
  }
};

// Keep your existing functions and add:
export const patchHeartbeat = async (id, data) => {
  try {
    const response = await API.patch(`heartbeats/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to update heartbeat");
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

export const createBulkWebsites = async (websites) => {
  try {
    const response = await API.post("websites/bulk_create/", { websites });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (errorData) {
      // Handle general error
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      
      // Handle bulk errors - show first error
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        if (firstError.errors?.url) {
          throw new Error(Array.isArray(firstError.errors.url) 
            ? firstError.errors.url[0] 
            : firstError.errors.url);
        }
      }
    }
    
    throw new Error("Failed to save websites. Please try again.");
  }
};

/**
 * Bulk create notification preferences for multiple websites on onboarding
 */
export const createBulkPreferences = async (model, objectIds, method, target) => {
  try {
    const response = await API.post("alerts/bulk_create/", {
      model,
      object_ids: objectIds,
      method,
      target,
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (errorData) {
      // Handle general error
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      
      // Handle bulk errors - show first error
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const firstError = errorData.errors[0];
        if (firstError.errors) {
          // Get the first field error
          const errorFields = Object.keys(firstError.errors);
          if (errorFields.length > 0) {
            const firstField = errorFields[0];
            const message = Array.isArray(firstError.errors[firstField])
              ? firstError.errors[firstField][0]
              : firstError.errors[firstField];
            throw new Error(message);
          }
        }
      }
    }
    
    throw new Error("Failed to save notification preferences. Please try again.");
  }
};

export const testEmailOnly = async (email) => {
  try {
    return await API.post("notifications/test_email/", { email });
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.error) {
      throw new Error(errorData.error);
    }
    throw new Error("Failed to send test email. Please try again.");
  }
};

// test general notification
export const testNotification = async (channel, value) => {
  try {
    const response = await API.post("test-notification/", { channel, value });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to send test notification");
  }
};


export const getDashboardMetrics = async () => {
  try {
    const response = await API.get("dashboard-metrics/");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    throw error;
  }
};


// ============================================
// NOTIFICATION PREFERENCE APIs
// ============================================

export const getNotificationPreferences = async () => {
  try {
    const response = await API.get("preferences/");  // ✅ matches your backend
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch notification preferences");
  }
};

export const createNotificationPreference = async (data) => {
  try {
    const response = await API.post("preferences/", data);  // ✅ matches
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create notification preference");
  }
};

export const updateNotificationPreference = async (id, data) => {
  try {
    const response = await API.patch(`preferences/${id}/`, data);  // ✅ matches
    return response.data;
  } catch (error) {
    throw new Error("Failed to update notification preference");
  }
};

export const deleteNotificationPreference = async (id) => {
  try {
    const response = await API.delete(`preferences/${id}/`);  // ✅ matches
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete notification preference");
  }
};



export default API;