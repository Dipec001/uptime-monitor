// src/pages/MonitorsPage.jsx
import React, { useState, useEffect } from "react";
import { fetchWebsites, createWebsite } from "../services/Api.js";

const MonitorsPage = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newWebsite, setNewWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch websites
  useEffect(() => {
    const loadWebsites = async () => {
      setLoading(true);
      try {
        const res = await fetchWebsites();
        setWebsites(res.data.results || []);

      } catch (err) {
        console.error("Error fetching websites:", err);
      } finally {
        setLoading(false);
      }
    };
    loadWebsites();
  }, []);

  // Add new website
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (!newWebsite.trim()) return;

    setSubmitting(true);
    try {
      const res = await createWebsite({ url: newWebsite });
      setWebsites((prev) => [...prev, res.data]);
      setNewWebsite("");
    } catch (err) {
      console.error("Error adding website:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Website Monitors</h1>

      {/* Add website form */}
      <form onSubmit={handleAddWebsite} className="flex gap-2 mb-6">
        <input
          type="url"
          placeholder="https://example.com"
          value={newWebsite}
          onChange={(e) => setNewWebsite(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <span className="mr-2">➕</span>
          )}
          Add
        </button>
      </form>

      {/* Websites list */}
      {loading ? (
        <p>Loading...</p>
      ) : websites.length === 0 ? (
        <p className="text-gray-500">No websites added yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => (
            <div
              key={site.id}
              className="rounded-lg border shadow p-4 bg-white"
            >
              <h2 className="font-medium">{site.name || site.url}</h2>
              <p className="text-sm text-gray-500">{site.url}</p>
              <p className="mt-2 text-sm">
                Status:{" "}
                <span
                  className={`font-medium ${
                    site.is_active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {site.is_active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonitorsPage;