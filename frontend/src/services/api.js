import axios from "axios";

// set your backend base URL
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // adjust if needed
});

// login function
export async function login(username, password) {
  const response = await API.post("login/", { username, password });
  return response.data; // this will have {access, refresh}
}

// register function
export async function register(username, password, email) {
  const response = await API.post("register/", { username, password, email });
  return response.data;
}

// example: check if token is still valid
export async function refreshToken(token) {
  const response = await API.post("token/refresh/", { token });
  return response.data;
}
