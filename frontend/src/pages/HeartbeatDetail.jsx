import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getHeartbeatDetail, 
  patchHeartbeat, 
  deleteHeartbeat,
  createNotificationPreference,
  deleteNotificationPreference 
} from "../services/api";

export default function HeartbeatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    interval: 3600,
    grace_period: 60,
    is_active: true,
  });

  const [notifForm, setNotifForm] = useState({
    method: "email",
    target: "",
  });

  useEffect(() => {
    fetchHeartbeatDetail();
  }, [id]);

  const fetchHeartbeatDetail = async () => {
    try {
      setLoading(true);
      const response = await getHeartbeatDetail(id);
      setData(response);
      setFormData({
        name: response.heartbeat.name || "",
        interval: response.heartbeat.interval,
        grace_period: response.heartbeat.grace_period,
        is_active: response.heartbeat.is_active,
      });
    } catch (error) {
      console.error("Failed to fetch heartbeat detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await patchHeartbeat(id, formData);
      await fetchHeartbeatDetail();
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update heartbeat:", error);
      alert(error.message || "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHeartbeat(id);
      navigate("/dashboard/monitors");
    } catch (error) {
      console.error("Failed to delete heartbeat:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  const handleCopyPingUrl = () => {
    if (data?.heartbeat?.ping_url) {
      navigator.clipboard.writeText(data.heartbeat.ping_url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleAddNotification = async (e) => {
    e.preventDefault();
    try {
      await createNotificationPreference({
        model: "heartbeat",
        object_id: parseInt(id),
        method: notifForm.method,
        target: notifForm.target,
      });
      setNotifForm({ method: "email", target: "" });
      setShowNotifModal(false);
      await fetchHeartbeatDetail();
    } catch (error) {
      console.error("Failed to add notification:", error);
      alert("Failed to add notification. Please try again.");
    }
  };

  const handleDeleteNotification = async (notifId) => {
    if (!window.confirm("Remove this notification?")) return;
    
    try {
      await deleteNotificationPreference(notifId);
      await fetchHeartbeatDetail();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      alert("Failed to delete notification.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading heartbeat details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 -m-6 p-6">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Heartbeat not found</p>
          <button
            onClick={() => navigate("/dashboard/monitors")}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Monitors
          </button>
        </div>
      </div>
    );
  }

  const { heartbeat, uptime_percentage, ping_history_chart, recent_logs, notifications } = data;
  const statusColor = heartbeat.status === "up" ? "green" : heartbeat.status === "down" ? "red" : "gray";

  // Convert interval to human-readable format
  const intervalMinutes = Math.floor(heartbeat.interval / 60);
  const intervalHours = Math.floor(intervalMinutes / 60);
  const intervalDays = Math.floor(intervalHours / 24);
  
  let intervalDisplay = "";
  if (intervalDays > 0) {
    intervalDisplay = `${intervalDays} day${intervalDays > 1 ? 's' : ''}`;
  } else if (intervalHours > 0) {
    intervalDisplay = `${intervalHours} hour${intervalHours > 1 ? 's' : ''}`;
  } else {
    intervalDisplay = `${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}`;
  }

  return (
    <div className="min-h-screen bg-gray-900 -m-6 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/monitors")}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{heartbeat.name}</h1>
            <p className="text-gray-400 text-sm">Heartbeat Monitor</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditMode(false);
                setFormData({
                  name: heartbeat.name || "",
                  interval: heartbeat.interval,
                  grace_period: heartbeat.grace_period,
                  is_active: heartbeat.is_active,
                });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Status */}
        <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-${statusColor}-500/50 transition-all`}>
          <p className="text-gray-400 text-sm mb-2">Current Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full bg-${statusColor}-500 animate-heartbeat-dramatic`}></span>
            <p className={`text-2xl font-bold text-${statusColor}-400 uppercase`}>
              {heartbeat.status}
            </p>
          </div>
          {heartbeat.last_ping && (
            <p className="text-xs text-gray-500 mt-2">
              Last ping: {new Date(heartbeat.last_ping).toLocaleString()}
            </p>
          )}
        </div>

        {/* Uptime */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500/50 transition-all">
          <p className="text-gray-400 text-sm mb-2">Uptime (24h)</p>
          <p className={`text-2xl font-bold ${uptime_percentage >= 95 ? 'text-green-400' : uptime_percentage >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
            {uptime_percentage}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {data.successful_pings_24h} / {data.total_pings_24h} pings successful
          </p>
        </div>

        {/* Interval */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-all">
          <p className="text-gray-400 text-sm mb-2">Expected Interval</p>
          <p className="text-2xl font-bold text-purple-400">{intervalDisplay}</p>
          <p className="text-xs text-gray-500 mt-2">
            Grace: {heartbeat.grace_period}s
          </p>
        </div>

        {/* Next Due */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <p className="text-gray-400 text-sm mb-2">Next Expected Ping</p>
          <p className="text-lg font-bold text-blue-400">
            {heartbeat.next_due ? new Date(heartbeat.next_due).toLocaleTimeString() : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {heartbeat.is_active ? "Active" : "Paused"}
          </p>
        </div>
      </div>

      {/* Ping URL Card */}
      <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Ping URL</h3>
        <p className="text-gray-300 text-sm mb-3">
          Send a GET or POST request to this URL from your cron job or application:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={heartbeat.ping_url || ""}
            readOnly
            className="flex-1 bg-gray-800 text-gray-300 border border-gray-600 px-4 py-2 rounded-lg font-mono text-sm"
          />
          <button
            onClick={handleCopyPingUrl}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              copySuccess
                ? "bg-green-600 text-white"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {copySuccess ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-3">
          💡 Example: <code className="bg-gray-800 px-2 py-1 rounded">curl {heartbeat.ping_url}</code>
        </p>
      </div>

      {/* Edit Form */}
      {editMode && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Edit Heartbeat</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Daily Backup Job"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interval (seconds)
                </label>
                <input
                  type="number"
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Common: 3600 (1 hour), 86400 (1 day), 604800 (1 week)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grace Period (seconds)
                </label>
                <input
                  type="number"
                  value={formData.grace_period}
                  onChange={(e) => setFormData({ ...formData, grace_period: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Extra time before marking as down
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
                  Active monitoring
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-600 font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Notifications Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
          <button
            onClick={() => setShowNotifModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
          >
            + Add Notification
          </button>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    notif.method === 'email' ? 'bg-blue-500/20 text-blue-400' :
                    notif.method === 'slack' ? 'bg-purple-500/20 text-purple-400' :
                    notif.method === 'webhook' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {notif.method.toUpperCase()}
                  </span>
                  <span className="text-gray-300">{notif.target}</span>
                </div>
                <button
                  onClick={() => handleDeleteNotification(notif.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No notifications configured. Add one to get alerts!
          </p>
        )}
      </div>

      {/* Recent Ping Logs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Recent Ping Logs</h2>
        </div>
        <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
          {recent_logs.length > 0 ? (
            recent_logs.map((log, idx) => {
              const logStatus = log.status === "success" ? "success" : "fail";
              return (
                <div key={idx} className="px-6 py-4 hover:bg-gray-700/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          logStatus === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span
                        className={`font-semibold ${
                          logStatus === "success" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {log.runtime !== null && (
                      <span className="text-gray-400">Runtime: {log.runtime}s</span>
                    )}
                    {log.ip && <span className="text-gray-500">IP: {log.ip}</span>}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-gray-400 mt-2 bg-gray-700/50 p-2 rounded">
                      {log.notes}
                    </p>
                  )}
                  {log.user_agent && (
                    <p className="text-xs text-gray-500 mt-1">
                      User Agent: {log.user_agent}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">No ping logs available yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Send your first ping to <code className="bg-gray-700 px-2 py-1 rounded">{heartbeat.ping_url}</code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Notification Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add Notification</h3>
            <form onSubmit={handleAddNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Method</label>
                <select
                  value={notifForm.method}
                  onChange={(e) => setNotifForm({ ...notifForm, method: e.target.value })}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="email">Email</option>
                  <option value="slack">Slack</option>
                  <option value="webhook">Webhook</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {notifForm.method === 'email' ? 'Email Address' :
                   notifForm.method === 'slack' ? 'Slack Webhook URL' :
                   notifForm.method === 'webhook' ? 'Webhook URL' :
                   'WhatsApp Number'}
                </label>
                <input
                  type={notifForm.method === 'email' ? 'email' : 'text'}
                  value={notifForm.target}
                  onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value })}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={
                    notifForm.method === 'email' ? 'you@example.com' :
                    notifForm.method === 'slack' ? 'https://hooks.slack.com/...' :
                    notifForm.method === 'webhook' ? 'https://your-webhook.com/...' :
                    '+1234567890'
                  }
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifModal(false);
                    setNotifForm({ method: "email", target: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Delete Heartbeat?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <strong className="text-white">{heartbeat.name}</strong>?
              This action cannot be undone and all ping history will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}