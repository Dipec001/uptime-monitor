import React, { useState, useEffect } from "react";
import axios from "axios";
import AddMonitorModal from "../components/MonitorModal";

export default function MonitorsPage() {
  const [activeTab, setActiveTab] = useState("websites"); // "websites" or "heartbeats"
  const [showAddModal, setShowAddModal] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitors();
  }, []);

  const fetchMonitors = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Fetch websites
      const websitesResponse = await axios.get(
        "http://127.0.0.1:8000/api/websites/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWebsites(websitesResponse.data);

      // Fetch heartbeats
      const heartbeatsResponse = await axios.get(
        "http://127.0.0.1:8000/api/heartbeats/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHeartbeats(heartbeatsResponse.data);
    } catch (err) {
      console.error("Failed to fetch monitors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const token = localStorage.getItem("access_token");
      const endpoint = type === "website" ? "websites" : "heartbeats";
      
      await axios.delete(
        `http://127.0.0.1:8000/api/${endpoint}/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchMonitors(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) return <p className="text-white">Loading monitors...</p>;

  return (
    <div className="min-h-screen -m-6 p-6 bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Monitors</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Monitor
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("websites")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "websites"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Website Monitors ({websites.length})
        </button>
        <button
          onClick={() => setActiveTab("heartbeats")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "heartbeats"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Heartbeats / Cron Jobs ({heartbeats.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "websites" ? (
        <WebsiteMonitorsList websites={websites} onDelete={handleDelete} />
      ) : (
        <HeartbeatsList heartbeats={heartbeats} onDelete={handleDelete} />
      )}

      {/* Add Monitor Modal */}
      {showAddModal && (
        <AddMonitorModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMonitors();
          }}
        />
      )}
    </div>
  );
}

// Website Monitors List Component
function WebsiteMonitorsList({ websites, onDelete }) {
  if (websites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No website monitors yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {websites.map((site) => (
        <div key={site.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-semibold">{site.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded ${
                site.status === "up"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {site.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-2 truncate">{site.url}</p>
          <p className="text-gray-500 text-xs mb-3">
            Check every {site.check_interval} seconds
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
              View Details
            </button>
            <button
              onClick={() => onDelete(site.id, "website")}
              className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-600/30"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Heartbeats List Component
function HeartbeatsList({ heartbeats, onDelete }) {
  if (heartbeats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No heartbeats yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {heartbeats.map((beat) => (
        <div key={beat.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-semibold">{beat.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded ${
                beat.status === "up"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {beat.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">
            Interval: {beat.interval}s ({Math.floor(beat.interval / 3600)}h)
          </p>
          <p className="text-gray-400 text-sm mb-2">
            Grace period: {beat.grace_period || 0}s
          </p>
          <p className="text-gray-500 text-xs mb-3 truncate">
            Ping URL: {beat.ping_url}
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
              Copy URL
            </button>
            <button
              onClick={() => onDelete(beat.id, "heartbeat")}
              className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-600/30"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}