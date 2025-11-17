import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import WebsiteDetail from './pages/WebsiteDetail';
import HeartbeatDetail from './pages/HeartbeatDetail';


function App() {
  return (
    <Router>
      <div>
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

          {/* Protected dashboard pages */}
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/monitors" element={<MonitorsPage />} />
            <Route path="/dashboard/monitors/:id" element={<WebsiteDetail />} />
            <Route path="/dashboard/heartbeats/:id" element={<HeartbeatDetail />} />
            <Route path="/dashboard/alerts" element={<AlertsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;