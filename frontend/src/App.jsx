// import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from "./components/PrivateRoute";
import DashboardLayout from "./components/DashboardLayout";
import MonitorsPage from "./pages/Monitor";
import OAuthCallback from "./pages/OAuthCallback";
import Onboarding from "./pages/onboarding/Onboarding";
import SettingsPage from "./pages/Settings";
import AlertsPage from "./pages/Alerts";
import Contact from './pages/Contact';


function App() {
  return (
    <Router>
      <div style={{  }}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected dashboard pages - ALL wrapped in PrivateRoute */}
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="monitors" element={<MonitorsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
          </Route>
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;
