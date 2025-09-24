import axios from "axios";

// set your backend base URL
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // adjust if needed
});

// login function
export async function login(email, password) {
  const response = await API.post("login/", { email, password });
  console.log(response.data)
  return response.data; // this will have {access, refresh}
}

// register function
export async function register(password, email) {
  const response = await API.post("register/", { password, email });
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