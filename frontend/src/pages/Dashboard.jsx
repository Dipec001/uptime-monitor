import React, { useEffect, useState } from "react";
import { getDashboardMetrics } from "../services/api";
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
        const data = await getDashboardMetrics(); 
        
        setStats(data.stats);
        setRecentMonitors(data.recent_monitors || []);
        setRecentHeartbeats(data.recent_heartbeats || []);
        setRecentIncidents(data.recent_incidents || []);
        setResponseTimeData(data.response_time_chart || []);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
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
        <p className="text-gray-400">Welcome! Here's your monitoring overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Monitors */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 hover:border-blue-500/50 hover:shadow-blue-500/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Monitors</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total_websites}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full animate-pulse-slow">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Uptime Percentage - DYNAMIC COLOR */}
        <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow p-6 transition-all duration-300 hover:scale-105 ${
          uptime >= 95 
            ? 'hover:border-green-500/50 hover:shadow-green-500/20' 
            : 'hover:border-red-500/50 hover:shadow-red-500/20'
        } hover:shadow-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overall Uptime</p>
              <p className={`text-3xl font-bold mt-1 animate-pulse ${
                uptime >= 95 ? 'text-green-400' : 
                uptime >= 80 ? 'text-yellow-400' : 
                'text-red-400'
              }`}>
                {uptime}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.active_websites} of {stats.total_websites} up
              </p>
            </div>
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                uptime >= 95 ? 'bg-green-500/30' : 
                uptime >= 80 ? 'bg-yellow-500/30' : 
                'bg-red-500/30'
              }`}></div>
              <div className={`relative p-3 rounded-full animate-bounce-subtle ${
                uptime >= 95 ? 'bg-green-500/20' : 
                uptime >= 80 ? 'bg-yellow-500/20' : 
                'bg-red-500/20'
              }`}>
                {uptime >= 95 ? (
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : uptime >= 80 ? (
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Heartbeats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 hover:border-purple-500/50 hover:shadow-purple-500/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Heartbeats</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total_heartbeats}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full animate-pulse-slow">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Heartbeats - DRAMATIC HEARTBEAT */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 hover:border-green-500/50 hover:shadow-green-500/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
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
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-heartbeat-glow"></div>
              <div className="relative bg-green-500/20 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-400 animate-heartbeat-dramatic" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 mb-6 hover:border-blue-500/30 transition-all">
        <h2 className="text-lg font-semibold text-white mb-4">
          Response Time (Last 24 Hours)
        </h2>
        {responseTimeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => {
                  // ✅ Convert ISO string to local time
                  const date = new Date(value);
                  return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  });
                }}
              />
              <YAxis 
                label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
                labelStyle={{ color: '#9CA3AF' }}
                labelFormatter={(value) => {
                  // ✅ Format tooltip time to local timezone
                  const date = new Date(value);
                  return date.toLocaleString();
                }}
                formatter={(value) => [`${value} ms`, 'Response Time']}
              />
              <Line 
                type="monotone" 
                dataKey="response_time" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No response time data available yet</p>
            <p className="text-gray-600 text-sm mt-2">Add monitors to start tracking response times</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow overflow-hidden hover:border-red-500/30 transition-all">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Recent Incidents</h2>
          </div>
          <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
            {recentIncidents.length > 0 ? (
              recentIncidents.map((incident, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping-slow"></span>
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow overflow-hidden hover:border-green-500/30 transition-all">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Website Monitors</h2>
          </div>
          <div className="divide-y divide-gray-700 max-h-80 overflow-y-auto">
            {recentMonitors.length > 0 ? (
              recentMonitors.map((monitor, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          monitor.status === "up" ? "bg-green-500 animate-pulse" : "bg-red-500 animate-ping-slow"
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