import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWebsites, getHeartbeats } from "../services/api";
import AddMonitorModal from "../components/MonitorModal";

export default function MonitorsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("websites");
  const [showAddModal, setShowAddModal] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMonitors();
  }, []);

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch websites
      const websitesData = await getWebsites();
      setWebsites(Array.isArray(websitesData) ? websitesData : websitesData.results || []);

      // Fetch heartbeats
      const heartbeatsData = await getHeartbeats();
      setHeartbeats(Array.isArray(heartbeatsData) ? heartbeatsData : heartbeatsData.results || []);
    } catch (err) {
      console.error("Failed to fetch monitors:", err);
      setError("Failed to load monitors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen -m-6 p-6 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading monitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 p-6 bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Monitors</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
        >
          + Add Monitor
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          {error}
        </div>
      )}

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
        <WebsiteMonitorsList websites={websites} />
      ) : (
        <HeartbeatsList heartbeats={heartbeats} />
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
function WebsiteMonitorsList({ websites }) {
  const navigate = useNavigate();

  if (!websites || websites.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No website monitors yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {websites.map((site) => (
        <div 
          key={site.id} 
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition group"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-semibold truncate flex-1">{site.name || site.url}</h3>
            <span
              className={`px-2 py-1 text-xs rounded ml-2 ${
                site.is_active
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {site.is_active ? "ACTIVE" : "PAUSED"}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-2 truncate">{site.url}</p>
          <p className="text-gray-500 text-xs mb-3">
            Check every {site.check_interval} minute{site.check_interval !== 1 ? 's' : ''}
          </p>
          
          <button 
            onClick={() => navigate(`/dashboard/monitors/${site.id}`)}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition font-medium"
          >
            View Details →
          </button>
        </div>
      ))}
    </div>
  );
}

// Heartbeats List Component
function HeartbeatsList({ heartbeats }) {
  const navigate = useNavigate();

  if (!heartbeats || heartbeats.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No heartbeats yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {heartbeats.map((beat) => (
        <div 
          key={beat.id} 
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition group"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-semibold truncate flex-1">{beat.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded ml-2 ${
                beat.status === "up"
                  ? "bg-green-500/20 text-green-400"
                  : beat.status === "down"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {beat.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">
            Interval: {Math.floor(beat.interval / 60)}min ({beat.interval}s)
          </p>
          <p className="text-gray-400 text-sm mb-2">
            Grace: {beat.grace_period}s
          </p>
          <p className="text-gray-500 text-xs mb-3 truncate">
            Key: {beat.key}
          </p>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/dashboard/heartbeats/${beat.id}`)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition font-medium"
            >
              View Details →
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(beat.ping_url);
                alert("Ping URL copied to clipboard!");
              }}
              className="bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition"
              title="Copy ping URL"
            >
              📋
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}