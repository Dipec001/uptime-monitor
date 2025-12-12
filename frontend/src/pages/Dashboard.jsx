import React, { useEffect, useState } from "react";
import { getDashboardMetrics } from "../services/api";
import { Line } from "recharts";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DateRangePicker from "../components/DateRangePicker";

function Dashboard() {
  // Date range state - default to last 24 hours
  const [dateRange, setDateRange] = useState([
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date()
  ]);

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
  const [aggregationMode, setAggregationMode] = useState('auto'); // 'auto' or interval in minutes

  useEffect(() => {
    fetchDashboard();
  }, [dateRange, aggregationMode]); // Watch BOTH dateRange and aggregationMode!

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
    // If user selected manual aggregation, use that
    if (aggregationMode !== 'auto') {
      return parseInt(aggregationMode);
    }
    
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

  const fetchDashboard = async () => {
    try {
      // Format dates for API
      const params = {
        start_date: dateRange[0].toISOString(),
        end_date: dateRange[1].toISOString()
      };

      const data = await getDashboardMetrics(params); 
      
      setStats(data.stats);
      setRecentMonitors(data.recent_monitors || []);
      setRecentHeartbeats(data.recent_heartbeats || []);
      setRecentIncidents(data.recent_incidents || []);
      
      // Aggregate response time data for better readability
      const rawData = data.response_time_chart || [];
      const interval = getAggregationInterval();
      const aggregatedData = aggregateData(rawData, interval);
      setResponseTimeData(aggregatedData);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Smart tick formatter that shows fewer labels based on data density
  const getTickInterval = () => {
    const dataLength = responseTimeData.length;
    if (dataLength <= 12) return 0; // Show all ticks
    if (dataLength <= 24) return 1; // Show every other tick
    if (dataLength <= 48) return 3; // Show every 4th tick
    if (dataLength <= 96) return 7; // Show every 8th tick
    return Math.floor(dataLength / 12); // Show ~12 ticks maximum
  };

  // Smart dot config - hide dots when too many points to avoid clutter
  const getDotConfig = () => {
    const pointCount = responseTimeData.length;
    if (pointCount <= 30) return { fill: '#3B82F6', r: 5 };     // Big dots for sparse data
    if (pointCount <= 60) return { fill: '#3B82F6', r: 3 };     // Medium dots
    return false;                                                // No dots for dense data
  };

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

  // Get aggregation info for display
  const diffHours = (dateRange[1] - dateRange[0]) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  const isMobile = window.innerWidth < 768;
  const aggregationInterval = getAggregationInterval();
  
  // Determine label based on interval
  const getAggregationLabel = () => {
    // Show if manual mode is active
    const prefix = aggregationMode !== 'auto' ? '' : '';
    
    if (aggregationInterval === 1) return prefix + 'Raw (1-min)';
    if (aggregationInterval === 2) return prefix + (isMobile ? '4-min' : '2-min');
    if (aggregationInterval === 4) return prefix + '4-min';
    if (aggregationInterval === 5) return prefix + (isMobile ? '10-min' : '5-min');
    if (aggregationInterval === 10) return prefix + (isMobile ? '20-min' : '10-min');
    if (aggregationInterval === 15) return prefix + '15-min';
    if (aggregationInterval === 20) return prefix + (isMobile ? '40-min' : '20-min');
    if (aggregationInterval === 30) return prefix + (isMobile ? '1-hour' : '30-min');
    if (aggregationInterval === 40) return prefix + '40-min';
    if (aggregationInterval === 60) return prefix + '1-hour';
    if (aggregationInterval === 120) return prefix + (isMobile ? '4-hour' : '2-hour');
    if (aggregationInterval === 180) return prefix + '3-hour';
    if (aggregationInterval === 240) return prefix + (isMobile ? '8-hour' : '4-hour');
    if (aggregationInterval === 360) return prefix + '6-hour';
    if (aggregationInterval === 480) return prefix + '8-hour';
    if (aggregationInterval === 720) return prefix + (isMobile ? '1-day' : '12-hour');
    if (aggregationInterval === 1440) return prefix + '1-day';
    return prefix + `${Math.round(aggregationInterval / 60)}h`;
  };
  
  const aggregationLabel = getAggregationLabel();

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

      {/* Date Range Picker */}
      <div className="mb-6">
        <DateRangePicker
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onDateChange={setDateRange}
        />
      </div>

      {/* Aggregation Control */}
      <div className="mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-gray-400 text-sm font-medium">Data Aggregation:</span>
            </div>
            
            <select
              value={aggregationMode}
              onChange={(e) => setAggregationMode(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none cursor-pointer hover:bg-gray-600 transition"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="1">Raw Data (1-minute)</option>
              <option value="5">5-minute intervals</option>
              <option value="10">10-minute intervals</option>
              <option value="15">15-minute intervals</option>
              <option value="30">30-minute intervals</option>
              <option value="60">1-hour intervals</option>
              <option value="120">2-hour intervals</option>
              <option value="180">3-hour intervals</option>
              <option value="240">4-hour intervals</option>
              <option value="360">6-hour intervals</option>
              <option value="720">12-hour intervals</option>
              <option value="1440">Daily intervals</option>
            </select>

            {aggregationMode !== 'auto' && (
              <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Manual mode active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6 mb-6 hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Response Time ({dateRange[0].toLocaleDateString()} - {dateRange[1].toLocaleDateString()})
          </h2>
          {responseTimeData.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
              {aggregationLabel} averages • {responseTimeData.length} data points
            </span>
          )}
        </div>
        
        {/* Smart Data Warning */}
        {aggregationMode !== 'auto' && responseTimeData.length > 200 && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-orange-400 font-semibold text-sm">High Data Density</p>
              <p className="text-orange-300 text-xs mt-1">
                Showing {responseTimeData.length} data points. Chart may appear cluttered. Consider using "Auto" mode or a larger aggregation interval for better visualization.
              </p>
            </div>
          </div>
        )}
        {responseTimeData.length > 0 && responseTimeData.length < 10 && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Limited Data Points</p>
              <p className="text-yellow-300 text-xs mt-1">
                Only {responseTimeData.length} data point{responseTimeData.length !== 1 ? 's' : ''} available for this range. 
                {responseTimeData.length < 5 ? ' Consider selecting a longer date range for better trend visualization.' : ' Chart may appear sparse.'}
              </p>
            </div>
          </div>
        )}
        {responseTimeData.length > 0 && responseTimeData.length >= 10 && responseTimeData.length < 20 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-blue-400 font-semibold text-sm">Sparse Data</p>
              <p className="text-blue-300 text-xs mt-1">
                Showing {responseTimeData.length} data points. You can select a longer range for more detailed trends.
              </p>
            </div>
          </div>
        )}
        
        {responseTimeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={getTickInterval()}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  // Format based on time range for optimal readability
                  if (diffHours <= 24) {
                    // For daily view, show time only
                    return date.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    });
                  } else if (diffHours <= 168) { // <= 7 days
                    // For weekly view, show day + time
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit'
                    });
                  } else {
                    // For monthly/quarterly view, show date only
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });
                  }
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Response Time (ms)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fill: '#9CA3AF', fontSize: '12px' } 
                }} 
                stroke="#9CA3AF"
                style={{ fontSize: '11px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
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
                activeDot={{ r: 5, fill: '#60A5FA' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No response time data available for this period</p>
            <p className="text-gray-600 text-sm mt-2">Try selecting a different date range or add monitors</p>
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