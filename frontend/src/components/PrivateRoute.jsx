// PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/api.js";

export default function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    // Not logged in → redirect to login
    return <Navigate to="/login" />;
  }
  return children;
}
