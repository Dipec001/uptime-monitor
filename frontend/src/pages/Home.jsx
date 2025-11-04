import signUp from "../assets/SignUp.svg";
import monitor from "../assets/Monitor.svg";
import bell from "../assets/Bell.svg";
import website from "../assets/Website.svg";
import tracking from "../assets/Tracking.svg";
import ping from "../assets/Ping.svg";
import frame from "../assets/Frame.svg";
import React, { useState, useEffect } from "react";

function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="bg-aliveBlue min-h-screen flex flex-col justify-center">
        {/* Navbar */}
        <nav
          className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-colors duration-300 ${
            scrolled
              ? "bg-aliveBlue shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
              : "bg-transparent"
          }`}
        >
          <img src={frame} alt="logo" className="w-15 h-15" />
          <div className="space-x-4">
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Get Started
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center md:items-start px-4 md:px-20 py-20">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Stay <span className="text-blue-600">Calm</span>, Always Knowing
              Your Services Run Smoothly
            </h1>
            <p className="text-gray-500 mb-6 text-lg md:text-xl">
              At Alive Checks, we ensures your websites and cronjobs are always
              running. Get instant alerts when downtime happens.
            </p>
            <a
              href="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Monitoring
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 py-8">
        <div className="text-center px-4 sm:px-none">
          <h3 className="text-2xl font-bold mb-2">
            How does Alive Checks work?
          </h3>
          <p className="text-gray-600">
            It only takes a few minutes to keep your site up
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 my-5">
          <div className="flex flex-col items-center text-center p-4">
            <img src={signUp} alt="sign up logo" className="mb-6 w-10 h-10 p-2 bg-blue-600 rounded-lg" />
            <h4 className="font-semibold mb-2">1. Sign Up</h4>
            <p>
              Create your free account with just your name, email and password.
              No setup hassle
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <img
              src={monitor}
              alt="Add website logo"
              className="mb-6 w-10 h-10 p-2 bg-blue-600 rounded-lg"
            />
            <h4 className="font-semibold mb-2">2. Add your Website</h4>
            <p>
              Enter your website URL to start monitoring uptime, speed and
              overall performance
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <img
              src={bell}
              alt="Get notified logo"
              className="mb-6 w-10 h-10 p-2 bg-blue-600 rounded-lg"
            />
            <h4 className="font-semibold mb-2">3. Get notified instantly</h4>
            <p>
              Receive alerts via email, whatsapp or slack the moment something
              goes wrong
            </p>
          </div>
        </div>
      </div>
      <div className="bg-aliveBlue py-8 px-4 sm:px-20">
        <div className="text-center py-8">
          <h3 className="text-white">
            Everything that matters tracked in one place
          </h3>
          <p className="text-gray-600">
            Relax, our all in one monitoring platform will watch your websites
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-10 mt-5 justify-center">
          <div className="flex flex-col flex-1 bg-white p-4 border rounded-lg md:max-w-[300px] min-h-[300px]">
            <img src={website} alt="sign up logo" className="mb-6 w-10 h-10 p-2 bg-blue-600 rounded-lg" />
            <h4 className="font-semibold mb-2">Website Monitoring</h4>
            <p className="mb-8">
              Everything that matters all in one place. All your essential
              website checks, simplified
            </p>
            <span className="self-start inline-block border border-[#0F172A] rounded-full px-2 py-1 my-5 text-[#0F172A] font-semibold cursor-pointer hover:bg-[#0F172A] hover:text-white transition">
              Learn More
            </span>
          </div>
          <div className="flex flex-col flex-1 bg-white p-4 border rounded-lg md:max-w-[300px] min-h-[300px]">
            <img
              src={tracking}
              alt="Add website logo"
              className="mb-6 w-10 h-10 p-2 bg-blue-600 rounded-lg"
            />
            <h4 className="font-semibold mb-2">Cron Job Monitoring</h4>
            <p className="mb-8">
              Your background jobs will never miss silently with our
              heartbeat/cronjob monitoring
            </p>
            <span className="self-start inline-block border border-[#0F172A] rounded-full px-2 py-1 my-5 text-[#0F172A] font-semibold cursor-pointer hover:bg-[#0F172A] hover:text-white transition">
              Learn More
            </span>
          </div>
          <div className="flex flex-col flex-1 bg-white p-4 border rounded-lg md:max-w-[300px] min-h-[300px]">
            <img
              src={ping}
              alt="Get notified logo"
              className="mb-6 w-10 h-10 p-2 bg-blue-600 rounded-lg"
            />
            <h4 className="font-semibold mb-2">Response Time Tracking</h4>
            <p className="mb-8">
              keep tabs on how fast your site loads. Catch slowdowns before they
              become serious
            </p>
            <span className="self-start inline-block border border-[#0F172A] rounded-full px-2 py-1 my-5 text-[#0F172A] font-semibold cursor-pointer hover:bg-[#0F172A] hover:text-white transition">
              Learn More
            </span>
          </div>
        </div>
        <div className="text-center py-8">
          <a
            className="inline-block bg-blue-600 border border-[#0F172A] rounded-[10px] px-6 py-3 font-semibold text-white hover:bg-white hover:text-aliveBlue transition"
            href="/dashboard"
          >
            Start monitoring in 30 seconds
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} Uptime Monitor. All rights reserved.
      </footer>
    </>
  );
}

export default Home;
