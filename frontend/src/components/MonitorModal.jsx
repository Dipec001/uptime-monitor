import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddMonitorModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("select"); // "select", "website", "heartbeat"
  const [websiteData, setWebsiteData] = useState({
    name: "",
    url: "",
    check_interval: 300,
    timeout: 10,
    notifications: {
      email: { enabled: false, address: "" },
      slack: { enabled: false, webhook: "" },
      whatsapp: { enabled: false, number: "" },
    },
  });
  const [heartbeatData, setHeartbeatData] = useState({
    name: "",
    interval: 86400,
    grace_period: 3600,
    notifications: {
      email: { enabled: false, address: "" },
      slack: { enabled: false, webhook: "" },
      whatsapp: { enabled: false, number: "" },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Fetch user email on mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://127.0.0.1:8000/api/user/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserEmail(response.data.email);
        
        // Auto-populate email in both forms
        setWebsiteData(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            email: { ...prev.notifications.email, address: response.data.email },
          },
        }));
        setHeartbeatData(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            email: { ...prev.notifications.email, address: response.data.email },
          },
        }));
      } catch (err) {
        console.error("Failed to fetch user email:", err);
      }
    };
    fetchUserEmail();
  }, []);

  const handleWebsiteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/websites/",
        websiteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create website monitor");
    } finally {
      setLoading(false);
    }
  };

  const handleHeartbeatSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/heartbeats/",
        heartbeatData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create heartbeat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {step === "select"
              ? "Choose Monitor Type"
              : step === "website"
              ? "Add Website Monitor"
              : "Add Heartbeat / Cron Job"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          {step === "select" && (
            <SelectMonitorType
              onSelectWebsite={() => setStep("website")}
              onSelectHeartbeat={() => setStep("heartbeat")}
            />
          )}

          {step === "website" && (
            <WebsiteMonitorForm
              data={websiteData}
              setData={setWebsiteData}
              onSubmit={handleWebsiteSubmit}
              onBack={() => setStep("select")}
              loading={loading}
            />
          )}

          {step === "heartbeat" && (
            <HeartbeatForm
              data={heartbeatData}
              setData={setHeartbeatData}
              onSubmit={handleHeartbeatSubmit}
              onBack={() => setStep("select")}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Select Monitor Type
function SelectMonitorType({ onSelectWebsite, onSelectHeartbeat }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={onSelectWebsite}
        className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-blue-500 rounded-lg p-6 text-left transition-all"
      >
        <div className="text-blue-400 mb-3">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Website Monitor</h3>
        <p className="text-gray-400 text-sm">
          Monitor uptime of websites and APIs. We'll ping your URL at regular intervals.
        </p>
      </button>

      <button
        onClick={onSelectHeartbeat}
        className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 hover:border-blue-500 rounded-lg p-6 text-left transition-all"
      >
        <div className="text-green-400 mb-3">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Heartbeat / Cron Job</h3>
        <p className="text-gray-400 text-sm">
          Monitor cron jobs and scheduled tasks. Your service pings us to confirm it's running.
        </p>
      </button>
    </div>
  );
}

// Notification Channels Component (shared)
function NotificationChannels({ notifications, setNotifications }) {
  const [testingChannel, setTestingChannel] = useState(null);
  const [activeChannel, setActiveChannel] = useState("email"); // Default to email

  const handleTestNotification = async (channel) => {
    setTestingChannel(channel);
    
    try {
      const token = localStorage.getItem("access_token");
      const channelData = 
        channel === "email" ? notifications.email.address :
        channel === "slack" ? notifications.slack.webhook :
        notifications.whatsapp.number;
      
      await axios.post(
        "http://127.0.0.1:8000/api/test-notification/",
        {
          channel,
          value: channelData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Test ${channel} notification sent successfully!`);
    } catch (err) {
      alert(`Failed to send test notification: ${err.response?.data?.detail || err.message}`);
    } finally {
      setTestingChannel(null);
    }
  };

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
    
    // Update notifications - only the selected one is enabled
    setNotifications({
      email: { ...notifications.email, enabled: channel === "email" },
      slack: { ...notifications.slack, enabled: channel === "slack" },
      whatsapp: { ...notifications.whatsapp, enabled: channel === "whatsapp" },
    });
  };

  const updateChannelValue = (channel, value) => {
    setNotifications({
      ...notifications,
      [channel]: {
        ...notifications[channel],
        [channel === "email" ? "address" : channel === "slack" ? "webhook" : "number"]: value,
      },
    });
  };

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-4 pb-2 border-b border-blue-500">
        Notification Channels
      </h3>

      {/* Email */}
      <div className="mb-4">
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="radio"
            name="notification"
            checked={activeChannel === "email"}
            onChange={() => handleChannelChange("email")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-300">Email</span>
        </label>
        {activeChannel === "email" && (
          <div className="flex gap-2 ml-6">
            <input
              type="email"
              value={notifications.email.address}
              onChange={(e) => updateChannelValue("email", e.target.value)}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="your@email.com"
            />
            <button
              type="button"
              onClick={() => handleTestNotification("email")}
              disabled={testingChannel === "email"}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50"
            >
              {testingChannel === "email" ? "Sending..." : "Send test"}
            </button>
          </div>
        )}
      </div>

      {/* Slack */}
      <div className="mb-4">
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="radio"
            name="notification"
            checked={activeChannel === "slack"}
            onChange={() => handleChannelChange("slack")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-300">Slack</span>
        </label>
        {activeChannel === "slack" && (
          <div className="flex gap-2 ml-6">
            <input
              type="url"
              value={notifications.slack.webhook}
              onChange={(e) => updateChannelValue("slack", e.target.value)}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="https://hooks.slack.com/services/..."
            />
            <button
              type="button"
              onClick={() => handleTestNotification("slack")}
              disabled={testingChannel === "slack"}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50"
            >
              {testingChannel === "slack" ? "Sending..." : "Send test"}
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="mb-4">
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="radio"
            name="notification"
            checked={activeChannel === "whatsapp"}
            onChange={() => handleChannelChange("whatsapp")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="ml-2 text-gray-300">WhatsApp</span>
        </label>
        {activeChannel === "whatsapp" && (
          <div className="flex gap-2 ml-6">
            <input
              type="tel"
              value={notifications.whatsapp.number}
              onChange={(e) => updateChannelValue("whatsapp", e.target.value)}
              className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="+1234567890"
            />
            <button
              type="button"
              onClick={() => handleTestNotification("whatsapp")}
              disabled={testingChannel === "whatsapp"}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50"
            >
              {testingChannel === "whatsapp" ? "Sending..." : "Send test"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Website Monitor Form
function WebsiteMonitorForm({ data, setData, onSubmit, onBack, loading }) {
  const intervalOptions = [
    // { value: 30, label: "30s" },
    { value: 60, label: "1m" },
    { value: 300, label: "5m" },
    { value: 600, label: "10m" },
    { value: 1800, label: "30m" },
    { value: 3600, label: "1h" },
    { value: 7200, label: "2h" },
    { value: 21600, label: "6h" },
    { value: 86400, label: "24h" },
  ];

  return (
    <form onSubmit={onSubmit}>
      {/* Monitor Name */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Monitor Name*</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="Main Website"
          required
        />
      </div>

      {/* Website URL */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Website URL*</label>
        <input
          type="url"
          value={data.url}
          onChange={(e) => setData({ ...data, url: e.target.value })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="https://example.com"
          required
        />
      </div>

      {/* Monitoring Interval */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">
          Monitoring Interval
        </label>
        <p className="text-gray-500 text-xs mb-2">
          We recommend at least <span className="text-blue-400">1 minute</span>
        </p>
        <div className="grid grid-cols-4 gap-2">
          {intervalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setData({ ...data, check_interval: option.value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                data.check_interval === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeout */}
      <div className="mb-6">
        <label className="block text-gray-300 text-sm mb-2">
          Timeout (seconds)
        </label>
        <input
          type="number"
          value={data.timeout}
          onChange={(e) => setData({ ...data, timeout: parseInt(e.target.value) })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          min="5"
          max="60"
        />
      </div>

      {/* Notification Channels */}
      <NotificationChannels
        notifications={data.notifications}
        setNotifications={(notifications) => setData({ ...data, notifications })}
      />

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Monitor"}
        </button>
      </div>
    </form>
  );
}

// Heartbeat Form
function HeartbeatForm({ data, setData, onSubmit, onBack, loading }) {
  const intervalPresets = [
    { value: 60, label: "1 minute" },
    { value: 300, label: "5 minutes" },
    { value: 900, label: "15 minutes" },
    { value: 3600, label: "1 hour" },
    { value: 86400, label: "Daily (24h)" },
    { value: 604800, label: "Weekly" },
  ];

  return (
    <form onSubmit={onSubmit}>
      {/* Heartbeat Name */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Name*</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          placeholder="Daily Backup Job"
          maxLength={100}
          required
        />
        <p className="text-gray-500 text-xs mt-1">
          Give your cron job or scheduled task a descriptive name
        </p>
      </div>

      {/* Interval */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">
          Expected Interval (seconds)*
        </label>
        <p className="text-gray-500 text-xs mb-2">
          How often should your job ping us? (e.g., 86400 for daily)
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {intervalPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setData({ ...data, interval: preset.value })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                data.interval === preset.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={data.interval}
          onChange={(e) => setData({ ...data, interval: parseInt(e.target.value) })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          min="1"
          max="2147483647"
          required
        />
      </div>

      {/* Grace Period */}
      <div className="mb-6">
        <label className="block text-gray-300 text-sm mb-2">
          Grace Period (seconds)
        </label>
        <p className="text-gray-500 text-xs mb-2">
          Extra time buffer before alerting (e.g., 3600 for 1 hour grace)
        </p>
        <input
          type="number"
          value={data.grace_period}
          onChange={(e) => setData({ ...data, grace_period: parseInt(e.target.value) })}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          min="0"
          max="2147483647"
          placeholder="3600"
        />
      </div>

      {/* Notification Channels */}
      <NotificationChannels
        notifications={data.notifications}
        setNotifications={(notifications) => setData({ ...data, notifications })}
      />

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-blue-300 text-sm">
          💡 <strong>How it works:</strong> After creating this heartbeat, you'll receive a unique ping URL. 
          Configure your cron job to hit that URL on schedule. If we don't receive a ping within the 
          expected interval + grace period, we'll alert you.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Heartbeat"}
        </button>
      </div>
    </form>
  );
}