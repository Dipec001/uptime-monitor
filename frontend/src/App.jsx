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

          {/* All dashboard pages share sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<PrivateRoute><Dashboard /> </PrivateRoute>} />
            <Route path="monitors" element={<MonitorsPage />} />
          </Route>
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;
