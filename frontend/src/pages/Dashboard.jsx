import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "recharts";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    total_websites: 0,
    active_websites: 0,
    total_heartbeats: 0,
    active_heartbeats: 0,
  });
  const [recentMonitors, setRecentMonitors] = useState([]);
  const [recentHeartbeats, setRecentHeartbeats] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        // Fetch dashboard metrics
        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard-metrics/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setStats(response.data.stats);
        setRecentMonitors(response.data.recent_monitors || []);
        setRecentHeartbeats(response.data.recent_heartbeats || []);
        setRecentIncidents(response.data.recent_incidents || []);
        setResponseTimeData(response.data.response_time_chart || []);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-lg">Loading dashboard...</p>
      </div>
    );
  }

  const uptime = stats.total_websites > 0 
    ? ((stats.active_websites / stats.total_websites) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen -m-6 p-6 bg-gray-900">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your monitoring overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Monitors */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Monitors</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total_websites}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Uptime Percentage */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overall Uptime</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {uptime}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.active_websites} of {stats.total_websites} up
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Heartbeats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Heartbeats</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total_heartbeats}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Heartbeats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Heartbeats</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {stats.active_heartbeats}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.active_heartbeats} of {stats.total_heartbeats} healthy
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Response Time (Last 24 Hours)
        </h2>
        {responseTimeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="response_time" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-12">
            No response time data available yet
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Recent Incidents</h2>
          </div>
          <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
            {recentIncidents.length > 0 ? (
              recentIncidents.map((incident, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <div>
                        <p className="font-medium text-white">{incident.name}</p>
                        <p className="text-sm text-gray-400">
                          {incident.type === "website" ? "Website Monitor" : "Heartbeat"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(incident.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-red-400 mt-2">{incident.reason}</p>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400">No recent incidents 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Monitor Status */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Website Monitors</h2>
          </div>
          <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
            {recentMonitors.length > 0 ? (
              recentMonitors.map((monitor, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          monitor.status === "up" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <p className="font-medium text-white">{monitor.website_name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        monitor.status === "up"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {monitor.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Response: {monitor.response_time || "N/A"}ms</span>
                    <span>{new Date(monitor.last_check).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400">No monitors yet. Add one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;