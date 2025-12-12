import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ startDate, endDate, onDateChange }) => {
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [selectedRange, setSelectedRange] = useState('24h');

  // Detect which preset range is currently selected based on dates
  useEffect(() => {
    const now = new Date();
    const diffMs = now - startDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Check if it matches any preset ranges (with some tolerance for time drift)
    if (Math.abs(diffHours - 1) < 0.1) {
      setSelectedRange('1h');
      setShowCustomDates(false);
    } else if (Math.abs(diffHours - 3) < 0.2) {
      setSelectedRange('3h');
      setShowCustomDates(false);
    } else if (Math.abs(diffHours - 6) < 0.3) {
      setSelectedRange('6h');
      setShowCustomDates(false);
    } else if (Math.abs(diffHours - 12) < 0.5) {
      setSelectedRange('12h');
      setShowCustomDates(false);
    } else if (Math.abs(diffHours - 24) < 1) {
      setSelectedRange('24h');
      setShowCustomDates(false);
    } else if (Math.abs(diffDays - 7) < 0.5) {
      setSelectedRange('7d');
      setShowCustomDates(false);
    } else if (Math.abs(diffDays - 30) < 1) {
      setSelectedRange('30d');
      setShowCustomDates(false);
    } else if (Math.abs(diffDays - 90) < 2) {
      setSelectedRange('90d');
      setShowCustomDates(false);
    } else {
      // Custom range
      setSelectedRange('custom');
      setShowCustomDates(false);
    }
  }, [startDate, endDate]);

  const handleRangeSelect = (e) => {
    const value = e.target.value;
    setSelectedRange(value);

    if (value === 'custom') {
      setShowCustomDates(true);
      return;
    }

    setShowCustomDates(false);
    const end = new Date();
    const start = new Date();

    switch (value) {
      case '1h':
        start.setHours(start.getHours() - 1);
        break;
      case '3h':
        start.setHours(start.getHours() - 3);
        break;
      case '6h':
        start.setHours(start.getHours() - 6);
        break;
      case '12h':
        start.setHours(start.getHours() - 12);
        break;
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        break;
    }

    onDateChange([start, end]);
  };

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    const end = endDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    return `${start} → ${end}`;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      {/* Main Compact Line */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Icon and Label */}
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-400 text-sm font-medium">Date Range:</span>
        </div>

        {/* Dropdown Select */}
        <select
          value={selectedRange}
          onChange={handleRangeSelect}
          className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none cursor-pointer hover:bg-gray-600 transition"
        >
          <option value="1h">Last 1 Hour</option>
          <option value="3h">Last 3 Hours</option>
          <option value="6h">Last 6 Hours</option>
          <option value="12h">Last 12 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="custom">Custom Range...</option>
        </select>

        {/* Current Date Range Display */}
        <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg">
          <span className="font-medium">{formatDateRange()}</span>
        </div>

        {/* Close Custom Dates Button (only shown when custom dates are open) */}
        {showCustomDates && (
          <button
            onClick={() => {
              setShowCustomDates(false);
              setSelectedRange('24h');
              const end = new Date();
              const start = new Date();
              start.setHours(start.getHours() - 24);
              onDateChange([start, end]);
            }}
            className="ml-auto p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title="Close custom date picker"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Custom Date Pickers (shown only when custom is selected) */}
      {showCustomDates && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <DatePicker
              selected={startDate}
              onChange={(date) => onDateChange([date, endDate])}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="w-full sm:w-auto bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              dateFormat="MMM d, yyyy"
              placeholderText="Start Date"
            />
            
            <span className="text-gray-500 hidden sm:block">→</span>
            
            <DatePicker
              selected={endDate}
              onChange={(date) => onDateChange([startDate, date])}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="w-full sm:w-auto bg-gray-700 text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              dateFormat="MMM d, yyyy"
              placeholderText="End Date"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;