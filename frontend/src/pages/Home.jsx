// src/Home.jsx
import React from "react";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Uptime Monitor</h1>
        <div className="space-x-4">
          <a href="/login" className="hover:underline">
            Login
          </a>
          <a href="/register" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition">
            Register
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center text-center px-4">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
            Stay Online, Always.
          </h2>
          <p className="text-gray-600 mb-6">
            Our uptime monitoring dashboard ensures your websites and APIs are
            always running. Get instant alerts when downtime happens.
          </p>
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} Uptime Monitor. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
