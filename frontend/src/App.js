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
// import Alerts from "./pages/Alerts";
// import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* All dashboard pages share sidebar */}
          <Route path="/" element={<DashboardLayout />}>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /> </PrivateRoute>} />
            <Route path="/monitors" element={<MonitorsPage />} />
            {/* <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} /> */}
          </Route>
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;
