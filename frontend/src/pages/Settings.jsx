import React, { useState } from "react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    fullName: "Steve",
    email: "steve@example.com",
    timezone: "GMT+01:00 (Europe/Berlin)",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Saving:", formData);
    // Add your API call here
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      console.log("Deleting account...");
      // Add your delete account logic here
    }
  };

  return (
    <div className="min-h-screen -m-6 p-6 bg-gray-900">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">
          Edit your basic info
        </h2>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email Address */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Enter your email"
          />
        </div>

        {/* Time Zone */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm mb-2">Time Zone</label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="GMT+01:00 (Europe/Berlin)">
              (GMT+01:00) Europe/Berlin
            </option>
            <option value="GMT+00:00 (Europe/London)">
              (GMT+00:00) Europe/London
            </option>
            <option value="GMT-05:00 (America/New_York)">
              (GMT-05:00) America/New York
            </option>
            <option value="GMT-08:00 (America/Los_Angeles)">
              (GMT-08:00) America/Los Angeles
            </option>
            <option value="GMT+01:00 (Africa/Lagos)">
              (GMT+01:00) Africa/Lagos
            </option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-8"
        >
          Save
        </button>

        {/* Delete Account Section */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete account
          </h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            When you ask to delete your account, AliveChecklist will send a
            confirmation email. Clicking the link in that email will permanently
            delete your account, monitors, logs, and all settings. Once deleted,
            nothing can be recovered.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}