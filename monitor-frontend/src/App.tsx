// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Never get caught off guard when your site goes down 🚨
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Get instant WhatsApp & Email alerts when your website is down. 
            Local payments, simple plans, built for you.
          </p>
          <a
            href="#pricing"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition"
          >
            Start Free
          </a>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10 text-center">
        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="font-bold text-xl mb-2">⚡ 1-minute checks</h3>
          <p className="text-gray-600">We monitor your site every 60s, not every 5 minutes like others.</p>
        </div>
        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="font-bold text-xl mb-2">📲 WhatsApp Alerts</h3>
          <p className="text-gray-600">Get downtime pings instantly on WhatsApp or email—no Slack required.</p>
        </div>
        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="font-bold text-xl mb-2">🇳🇬 Local Payments</h3>
          <p className="text-gray-600">Pay easily via Paystack/Flutterwave, no credit card needed.</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Simple Pricing</h2>
          <p className="text-gray-600 mb-12">Choose the plan that fits your needs. Start free, upgrade anytime.</p>
          <div className="grid md:grid-cols-4 gap-6">
            
            {/* Free */}
            <div className="bg-white shadow p-6 rounded-xl flex flex-col">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 mb-4">₦0 / month</p>
              <ul className="text-gray-600 text-sm mb-6 space-y-2">
                <li>✅ 3 monitors</li>
                <li>✅ 1-min checks</li>
                <li>✅ Email alerts</li>
              </ul>
              <button className="mt-auto bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Get Started
              </button>
            </div>

            {/* Starter */}
            <div className="bg-white shadow p-6 rounded-xl flex flex-col border-2 border-indigo-600">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-gray-500 mb-4">₦3,000 / month</p>
              <ul className="text-gray-600 text-sm mb-6 space-y-2">
                <li>✅ 10 monitors</li>
                <li>✅ 1-min checks</li>
                <li>✅ WhatsApp + Email alerts</li>
                <li>✅ SSL & Domain expiry checks</li>
              </ul>
              <button className="mt-auto bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Start Starter
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white shadow p-6 rounded-xl flex flex-col">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-gray-500 mb-4">₦8,000 / month</p>
              <ul className="text-gray-600 text-sm mb-6 space-y-2">
                <li>✅ 50 monitors</li>
                <li>✅ 1-min checks</li>
                <li>✅ WhatsApp group alerts</li>
                <li>✅ Custom status page</li>
              </ul>
              <button className="mt-auto bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Start Pro
              </button>
            </div>

            {/* Agency */}
            <div className="bg-white shadow p-6 rounded-xl flex flex-col">
              <h3 className="text-xl font-bold mb-2">Agency</h3>
              <p className="text-gray-500 mb-4">₦15,000 / month</p>
              <ul className="text-gray-600 text-sm mb-6 space-y-2">
                <li>✅ 200 monitors</li>
                <li>✅ 1-min checks</li>
                <li>✅ Branded status page</li>
                <li>✅ Client report exports</li>
              </ul>
              <button className="mt-auto bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Start Agency
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MonitorApp. Built for Africa 🌍
      </footer>
    </div>
  );
}

export default App;
