import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getWebsiteDetail, 
  patchWebsite, 
  deleteWebsite,
  createNotificationPreference,
  deleteNotificationPreference 
} from "../services/api";
import { Line } from "recharts";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DateRangePicker from "../components/DateRangePicker";

export default function WebsiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Date range state - default to last 24 hours
  const [dateRange, setDateRange] = useState([
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date()
  ]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlChanged, setUrlChanged] = useState(false);
  const [showUrlWarning, setShowUrlWarning] = useState(false);
  const [processedChartData, setProcessedChartData] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    check_interval: 5,
    is_active: true,
  });

  const [originalUrl, setOriginalUrl] = useState("");

  const [notifForm, setNotifForm] = useState({
    method: "email",
    target: "",
  });

  useEffect(() => {
    fetchWebsiteDetail();
  }, [id, dateRange]); // Refetch when date range changes

  // Aggregate data based on date range to improve readability
  const aggregateData = (data, intervalMinutes) => {
    if (!data || data.length === 0) return [];
    
    const aggregated = [];
    const groupedData = {};
    
    data.forEach(point => {
      const date = new Date(point.time);
      // Round down to nearest interval
      const roundedTime = new Date(
        Math.floor(date.getTime() / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000)
      );
      const key = roundedTime.toISOString();
      
      if (!groupedData[key]) {
        groupedData[key] = {
          time: key,
          response_times: [],
          count: 0
        };
      }
      
      groupedData[key].response_times.push(point.response_time);
      groupedData[key].count++;
    });
    
    // Calculate average for each group
    Object.keys(groupedData).forEach(key => {
      const group = groupedData[key];
      const avg = group.response_times.reduce((a, b) => a + b, 0) / group.count;
      aggregated.push({
        time: group.time,
        response_time: Math.round(avg),
        count: group.count
      });
    });
    
    return aggregated.sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  // Determine aggregation interval based on date range
  const getAggregationInterval = () => {
    const diffMs = dateRange[1] - dateRange[0];
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    // Detect mobile for extra aggregation
    const isMobile = window.innerWidth < 768;
    const mobileFactor = isMobile ? 2 : 1;
    
    // AGGRESSIVE aggregation for clean charts (max 50-100 points)
    if (diffHours <= 1) return 2 * mobileFactor;      // Desktop: ~30 pts, Mobile: ~15 pts (2-min/4-min)
    if (diffHours <= 3) return 5 * mobileFactor;      // Desktop: ~36 pts, Mobile: ~18 pts (5-min/10-min)
    if (diffHours <= 6) return 10 * mobileFactor;     // Desktop: ~36 pts, Mobile: ~18 pts (10-min/20-min)
    if (diffHours <= 12) return 20 * mobileFactor;    // Desktop: ~36 pts, Mobile: ~18 pts (20-min/40-min)
    if (diffHours <= 24) return 30 * mobileFactor;    // Desktop: ~48 pts, Mobile: ~24 pts (30-min/1-hour)
    if (diffHours <= 72) return 120 * mobileFactor;   // Desktop: ~36 pts, Mobile: ~18 pts (2hr/4hr)
    if (diffDays <= 7) return 240 * mobileFactor;     // Desktop: ~42 pts, Mobile: ~21 pts (4hr/8hr)
    if (diffDays <= 30) return 720 * mobileFactor;    // Desktop: ~60 pts, Mobile: ~30 pts (12hr/24hr)
    return 1440;                                       // Both: ~90 points (1-day)
  };

  const fetchWebsiteDetail = async () => {
    try {
      // setLoading(true);
      
      // ✅ Pass date range params to API
      const params = {
        start_date: dateRange[0].toISOString(),
        end_date: dateRange[1].toISOString()
      };
      
      const response = await getWebsiteDetail(id, params);
      setData(response);
      setFormData({
        name: response.website.name || "",
        url: response.website.url,
        check_interval: response.website.check_interval,
        is_active: response.website.is_active,
      });
      setOriginalUrl(response.website.url);

      // Aggregate response time data for better readability
      const rawData = response.response_time_chart || [];
      const interval = getAggregationInterval();
      const aggregatedData = aggregateData(rawData, interval);
      setProcessedChartData(aggregatedData);
    } catch (error) {
      console.error("Failed to fetch website detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (field === 'url' && value !== originalUrl) {
      setUrlChanged(true);
    } else if (field === 'url' && value === originalUrl) {
      setUrlChanged(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (urlChanged) {
      setShowUrlWarning(true);
      return;
    }
    
    await performUpdate();
  };

  const performUpdate = async () => {
    try {
      setSaving(true);
      await patchWebsite(id, formData);
      await fetchWebsiteDetail();
      setEditMode(false);
      setShowUrlWarning(false);
      setUrlChanged(false);
    } catch (error) {
      console.error("Failed to update website:", error);
      alert(error.message || "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWebsite(id);
      navigate("/dashboard/monitors");
    } catch (error) {
      console.error("Failed to delete website:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  const handleAddNotification = async (e) => {
    e.preventDefault();
    try {
      await createNotificationPreference({
        model: "website",
        object_id: parseInt(id),
        method: notifForm.method,
        target: notifForm.target,
      });
      setNotifForm({ method: "email", target: "" });
      setShowNotifModal(false);
      await fetchWebsiteDetail();
    } catch (error) {
      console.error("Failed to add notification:", error);
      alert("Failed to add notification. Please try again.");
    }
  };

  const handleDeleteNotification = async (notifId) => {
    if (!window.confirm("Remove this notification?")) return;
    
    try {
      await deleteNotificationPreference(notifId);
      await fetchWebsiteDetail();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      alert("Failed to delete notification.");
    }
  };

  // Smart tick formatter that shows fewer labels based on data density
  const getTickInterval = () => {
    const dataLength = processedChartData.length;
    if (dataLength <= 12) return 0; // Show all ticks
    if (dataLength <= 24) return 1; // Show every other tick
    if (dataLength <= 48) return 3; // Show every 4th tick
    if (dataLength <= 96) return 7; // Show every 8th tick
    return Math.floor(dataLength / 12); // Show ~12 ticks maximum
  };

  // Smart dot config - hide dots when too many points to avoid clutter
  const getDotConfig = () => {
    const pointCount = processedChartData.length;
    if (pointCount <= 30) return { fill: '#3B82F6', r: 5 };     // Big dots for sparse data
    if (pointCount <= 60) return { fill: '#3B82F6', r: 3 };     // Medium dots
    return false;                                                // No dots for dense data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 -m-6 p-6">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Website not found</p>
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

  const { website, latest_check, uptime_percentage, recent_history, notifications } = data;
  const statusColor = latest_check.status === "up" ? "green" : latest_check.status === "down" ? "red" : "gray";

  // Get aggregation info for display
  const diffHours = (dateRange[1] - dateRange[0]) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  const isMobile = window.innerWidth < 768;
  const aggregationInterval = getAggregationInterval();
  
  // Determine label based on interval
  const getAggregationLabel = () => {
    if (aggregationInterval === 2) return isMobile ? '4-min' : '2-min';
    if (aggregationInterval === 4) return '4-min';
    if (aggregationInterval === 5) return isMobile ? '10-min' : '5-min';
    if (aggregationInterval === 10) return isMobile ? '20-min' : '10-min';
    if (aggregationInterval === 20) return isMobile ? '40-min' : '20-min';
    if (aggregationInterval === 30) return isMobile ? '1-hour' : '30-min';
    if (aggregationInterval === 40) return '40-min';
    if (aggregationInterval === 60) return '1-hour';
    if (aggregationInterval === 120) return isMobile ? '4-hour' : '2-hour';
    if (aggregationInterval === 240) return isMobile ? '8-hour' : '4-hour';
    if (aggregationInterval === 480) return '8-hour';
    if (aggregationInterval === 720) return isMobile ? '1-day' : '12-hour';
    if (aggregationInterval === 1440) return '1-day';
    return `${Math.round(aggregationInterval / 60)}h`;
  };
  
  const aggregationLabel = getAggregationLabel();

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
            <h1 className="text-2xl font-bold text-white">{website.name || "Website Monitor"}</h1>
            <p className="text-gray-400 text-sm break-all">{website.url}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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
                setUrlChanged(false);
                setFormData({
                  name: website.name || "",
                  url: website.url,
                  check_interval: website.check_interval,
                  is_active: website.is_active,
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
            <span className={`w-3 h-3 rounded-full bg-${statusColor}-500 animate-pulse`}></span>
            <p className={`text-2xl font-bold text-${statusColor}-400 uppercase`}>
              {latest_check.status}
            </p>
          </div>
          {latest_check.checked_at && (
            <p className="text-xs text-gray-500 mt-2">
              Last checked: {new Date(latest_check.checked_at).toLocaleString()}
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
            {data.successful_checks_24h} / {data.total_checks_24h} checks passed
          </p>
        </div>

        {/* Response Time */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
          <p className="text-gray-400 text-sm mb-2">Response Time</p>
          <p className="text-2xl font-bold text-blue-400">
            {latest_check.response_time ? `${latest_check.response_time} ms` : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-2">Latest check</p>
        </div>

        {/* Check Interval */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-all">
          <p className="text-gray-400 text-sm mb-2">Check Interval</p>
          <p className="text-2xl font-bold text-purple-400">
            {website.check_interval_display}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {website.is_active ? "Active" : "Paused"}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Edit Website Monitor</h2>
          
          {urlChanged && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-yellow-400 font-semibold text-sm">URL Change Detected</p>
                <p className="text-yellow-300 text-xs mt-1">
                  You're about to change the monitored URL. Historical data (response times, uptime stats) will remain linked to this monitor, but future checks will monitor the new URL.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL {urlChanged && <span className="text-yellow-400">*Changed</span>}
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleFormChange('url', e.target.value)}
                  className={`w-full bg-gray-700 text-white border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    urlChanged ? 'border-yellow-500' : 'border-gray-600'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Check Interval
                </label>
                <select
                  value={formData.check_interval}
                  onChange={(e) => handleFormChange('check_interval', parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
                  Active monitoring
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 font-medium"
            >
              {saving ? "Saving..." : urlChanged ? "Confirm & Save Changes" : "Save Changes"}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
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
                    notif.method === 'whatsapp' ? 'bg-green-500/20 text-green-400' :
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

      {/* Date Range Picker */}
      <div className="mb-6">
        <DateRangePicker
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onDateChange={setDateRange}
        />
      </div>

      {/* Response Time Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Response Time ({dateRange[0].toLocaleDateString()} - {dateRange[1].toLocaleDateString()})
          </h2>
          {processedChartData.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
              {aggregationLabel} averages • {processedChartData.length} data points
            </span>
          )}
        </div>
        
        {/* Smart Data Warning */}
        {processedChartData.length > 0 && processedChartData.length < 10 && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Limited Data Points</p>
              <p className="text-yellow-300 text-xs mt-1">
                Only {processedChartData.length} data point{processedChartData.length !== 1 ? 's' : ''} available for this range. 
                {processedChartData.length < 5 ? ' Consider selecting a longer date range for better trend visualization.' : ' Chart may appear sparse.'}
              </p>
            </div>
          </div>
        )}
        {processedChartData.length > 0 && processedChartData.length >= 10 && processedChartData.length < 20 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-blue-400 font-semibold text-sm">Sparse Data</p>
              <p className="text-blue-300 text-xs mt-1">
                Showing {processedChartData.length} data points. You can select a longer range for more detailed trends.
              </p>
            </div>
          </div>
        )}
        
        {processedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                style={{ fontSize: "11px" }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={getTickInterval()}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  // Format based on time range for optimal readability
                  if (diffHours <= 24) {
                    // For daily view, show time only
                    return date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  } else if (diffHours <= 168) { // <= 7 days
                    // For weekly view, show day + time
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit"
                    });
                  } else {
                    // For monthly/quarterly view, show date only
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    });
                  }
                }}
              />
              <YAxis
                label={{
                  value: "Response Time (ms)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#9CA3AF", fontSize: "12px" },
                }}
                stroke="#9CA3AF"
                style={{ fontSize: "11px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleString();
                }}
                formatter={(value, name, props) => {
                  const count = props.payload.count;
                  return [
                    `${value} ms${count > 1 ? ` (avg of ${count})` : ''}`, 
                    'Response Time'
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="response_time"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={getDotConfig()}
                activeDot={{ r: 5, fill: "#60A5FA" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No data available for this period</p>
            <p className="text-gray-600 text-sm mt-2">Try selecting a different date range</p>
          </div>
        )}
      </div>

      {/* Recent Check History */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Recent Checks</h2>
        </div>
        <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
          {recent_history.length > 0 ? (
            recent_history.map((check, idx) => {
              const checkStatus = check.status_code >= 200 && check.status_code < 300 ? "up" : "down";
              return (
                <div key={idx} className="px-6 py-4 hover:bg-gray-700/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          checkStatus === "up" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span
                        className={`font-semibold ${
                          checkStatus === "up" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        HTTP {check.status_code}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(check.checked_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Response: {check.response_time} ms</span>
                    {check.ip && <span className="text-gray-500">IP: {check.ip}</span>}
                  </div>
                  {check.error_message && (
                    <p className="text-sm text-red-400 mt-2">{check.error_message}</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">No check history available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* URL Change Confirmation Modal */}
      {showUrlWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-yellow-500/50 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-white">Confirm URL Change</h3>
                <p className="text-gray-300 mt-2 text-sm">
                  You're changing the URL from:
                </p>
                <p className="text-gray-400 text-xs mt-1 font-mono bg-gray-700 p-2 rounded break-all">
                  {originalUrl}
                </p>
                <p className="text-gray-300 mt-2 text-sm">To:</p>
                <p className="text-yellow-400 text-xs mt-1 font-mono bg-gray-700 p-2 rounded break-all">
                  {formData.url}
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-yellow-300 text-xs">
                <strong>Note:</strong> All historical check data (response times, uptime stats) will remain associated with this monitor, but future checks will monitor the new URL.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUrlWarning(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={performUpdate}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:bg-gray-600"
              >
                {saving ? "Saving..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="slack">Slack</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {notifForm.method === 'email' ? 'Email Address' :
                   notifForm.method === 'slack' ? 'Slack Webhook URL' :
                   'WhatsApp Number'}
                </label>
                <input
                  type={notifForm.method === 'email' ? 'email' : 'text'}
                  value={notifForm.target}
                  onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value })}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    notifForm.method === 'email' ? 'you@example.com' :
                    notifForm.method === 'slack' ? 'https://hooks.slack.com/...' :
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
            <h3 className="text-xl font-bold text-white mb-2">Delete Website Monitor?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <strong className="text-white">{website.name || website.url}</strong>?
              This action cannot be undone and all historical data will be lost.
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