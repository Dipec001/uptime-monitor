import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { logout } from "../services/Api";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col h-screen">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-blue-600">The Monitor</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-3">
          <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</Link>
          <Link to="/monitors" className="block text-gray-700 hover:text-blue-600">Monitors</Link>
          <Link to="/alerts" className="block text-gray-700 hover:text-blue-600">Alerts</Link>
          <Link to="/settings" className="block text-gray-700 hover:text-blue-600">Settings</Link>
        </nav>
        <div className="px-6 py-4 border-t">
          <button
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
