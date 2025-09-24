// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
    const [stats, setStats] = useState({
        total_websites: 0,
        active_websites: 0,
        total_heartbeats: 0,
        active_heartbeats: 0,
    });
    const [recentMonitors, setRecentMonitors] = useState([]);
    const [recentHeartbeats, setRecentHeartbeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("access_token"); // or wherever you store it
            const response = await axios.get("http://127.0.0.1:8000/api/dashboard-metrics/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            setStats(response.data.stats);
            setRecentMonitors(response.data.recent_monitors);
            setRecentHeartbeats(response.data.recent_heartbeats);
        } catch (err) {
            console.error("Failed to fetch dashboard:", err);
        } finally {
            setLoading(false);
        }
        };

        fetchDashboard();
    }, []);

    if (loading) return <p>Loading dashboard...</p>;
  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <span className="text-gray-600">Welcome back 👋</span>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Monitors</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.total_websites}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Uptime (active websites)</h3>
            <p className="text-2xl font-bold text-green-600">{stats.active_websites}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Heartbeats</h3>
            <p className="text-2xl font-bold text-red-500">{stats.total_heartbeats}</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Active Heartbeats</h3>
            <p className="text-2xl font-bold text-red-500">{stats.active_heartbeats}</p>
          </div>
        </div>

        {/* Recent Monitors Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Monitors</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Website</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Check</th>
                <th className="px-4 py-2">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {recentMonitors.map((check, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{check.website_name}</td>
                  <td className={`px-4 py-2 font-semibold ${check.status === "up" ? "text-green-600" : "text-red-500"}`}>
                    {check.status.toUpperCase()}
                  </td>
                  <td className="px-4 py-2">{new Date(check.last_check).toLocaleString()}</td>
                  <td className="px-4 py-2">{check.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Cron jobs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Cron jobs</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Cron Job</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Ping</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentHeartbeats.map((check, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{check.cronjob_name}</td>
                  <td className={`px-4 py-2 font-semibold ${check.status === "up" ? "text-green-600" : "text-red-500"}`}>
                    {check.status.toUpperCase()}
                  </td>
                  <td className="px-4 py-2">{new Date(check.last_ping).toLocaleString()}</td>
                  <td className="px-4 py-2">{check.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
