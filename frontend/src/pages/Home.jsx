import signUp from "../assets/SignUp.svg";
import monitor from "../assets/Monitor.svg";
import bell from "../assets/Bell.svg";
import website from "../assets/Website.svg";
import tracking from "../assets/Tracking.svg";
import ping from "../assets/Ping.svg";
import frame from "../assets/Frame.svg";
import noti from "../assets/Notifications.png";
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

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
      {/* HERO - Dark & Dramatic */}
      <div className="bg-gray-900 min-h-screen flex flex-col justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

        {/* Navbar */}
        <nav
          className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 ${
            scrolled
              ? "bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-800"
              : "bg-transparent"
          }`}
        >
          <img src={frame} alt="Alive Checks" className="w-12 h-12" />
          <div className="space-x-4">
            <a
              href="/login"
              className="text-gray-300 hover:text-white transition hidden sm:inline-block"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/30"
            >
              Get Started Free
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-6 md:px-20 py-32 relative z-10">
          <div className="max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-gray-300 text-sm">Monitoring 1,500+ websites worldwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Sleep Better at Night.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                We'll Watch Your Sites.
              </span>
            </h1>
            
            <p className="text-gray-400 mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Stop worrying about angry customer emails at 3 AM. Get instant alerts 
              the moment something breaks, before your users even notice.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-xl shadow-blue-600/30 w-full sm:w-auto text-center"
              >
                Start Free Monitoring →
              </a>
              <a
                href="#how-it-works"
                className="border border-gray-700 text-gray-300 px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition w-full sm:w-auto text-center"
              >
                See How It Works
              </a>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              ✓ No credit card required  &nbsp;•&nbsp;  ✓ 2-minute setup  &nbsp;•&nbsp;  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof - Subtle Gray */}
      <div className="bg-gray-100 border-y border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-wider font-semibold">
            Trusted by developers at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50">
            <div className="text-gray-700 text-2xl font-bold">TechCorp</div>
            <div className="text-gray-700 text-2xl font-bold">StartupXYZ</div>
            <div className="text-gray-700 text-2xl font-bold">DevStudio</div>
            <div className="text-gray-700 text-2xl font-bold">CloudNet</div>
          </div>
        </div>
      </div>

      {/* Pain Points Section - Gradient Background */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop Firefighting. Start Preventing.
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Most downtime happens when you're asleep, in a meeting, or on vacation. 
              Don't let your business suffer in silence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Before */}
            <div className="bg-gray-800/50 backdrop-blur border border-red-500/30 rounded-xl p-6 hover:border-red-500/60 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">😰</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">Before Alive Checks</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Finding out from angry customers</li>
                <li>• Losing sales during downtime</li>
                <li>• Manual checking every few hours</li>
                <li>• Sleepless nights worrying</li>
              </ul>
            </div>

            {/* With - Highlighted */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 transform md:scale-105 shadow-2xl shadow-blue-500/30">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">With Alive Checks</h3>
              <ul className="text-blue-50 space-y-2 text-sm">
                <li>• Instant alerts before users notice</li>
                <li>• Zero missed downtime</li>
                <li>• Automated 24/7 monitoring</li>
                <li>• Peace of mind guaranteed</li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-gray-800/50 backdrop-blur border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">😌</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">After Alive Checks</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Customers never see downtime</li>
                <li>• Maintain 99.9% uptime easily</li>
                <li>• Fix issues proactively</li>
                <li>• Actually enjoy your weekends</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Light but not too white */}
      <div id="how-it-works" className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Up and Running in Under 2 Minutes
            </h3>
            <p className="text-gray-600 text-lg">
              Seriously. It's that simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-8 hover:shadow-2xl hover:shadow-blue-200/50 transition-all">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <img
                  src={signUp}
                  alt="Sign up"
                  className="w-14 h-14 p-3 bg-blue-600 rounded-lg mb-6 mx-auto"
                />
                <h4 className="font-semibold text-gray-900 text-xl mb-3 text-center">
                  Create Free Account
                </h4>
                <p className="text-gray-600 text-center">
                  Just your email and password. No credit card, no BS.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border-2 border-purple-200 rounded-xl p-8 hover:shadow-2xl hover:shadow-purple-200/50 transition-all">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <img
                  src={monitor}
                  alt="Add website"
                  className="w-14 h-14 p-3 bg-purple-600 rounded-lg mb-6 mx-auto"
                />
                <h4 className="font-semibold text-gray-900 text-xl mb-3 text-center">
                  Add Your Sites
                </h4>
                <p className="text-gray-600 text-center">
                  Paste your URL. We'll start monitoring in 30 seconds.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border-2 border-green-200 rounded-xl p-8 hover:shadow-2xl hover:shadow-green-200/50 transition-all">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <img
                  src={bell}
                  alt="Get notified"
                  className="w-14 h-14 p-3 bg-green-600 rounded-lg mb-6 mx-auto"
                />
                <h4 className="font-semibold text-gray-900 text-xl mb-3 text-center">
                  Relax & Get Alerted
                </h4>
                <p className="text-gray-600 text-center">
                  We'll ping you instantly if anything goes wrong. Sleep well.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features - Dark with VISIBLE Icons */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Stay Online
            </h3>
            <p className="text-gray-300 text-lg">
              Monitor what matters. Get alerted when it breaks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all group">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <img
                  src={website}
                  alt="Website monitoring"
                  className="w-8 h-8"
                />
              </div>
              <h4 className="font-semibold text-white text-xl mb-3">
                Website Monitoring
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                We check your site every minute. 1440 checks per day. If it's down for even 60 seconds, you'll know.
              </p>
              <a href="#" className="inline-flex items-center text-blue-400 font-medium group-hover:gap-2 transition-all">
                Learn More 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all group">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <img
                  src={tracking}
                  alt="Cron job monitoring"
                  className="w-8 h-8"
                />
              </div>
              <h4 className="font-semibold text-white text-xl mb-3">
                Cron Job Monitoring
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your background jobs matter too. Know immediately if your backups, imports, or scheduled tasks fail.
              </p>
              <a href="#" className="inline-flex items-center text-purple-400 font-medium group-hover:gap-2 transition-all">
                Learn More 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50 transition-all group">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <img
                  src={ping}
                  alt="Response time"
                  className="w-8 h-8"
                />
              </div>
              <h4 className="font-semibold text-white text-xl mb-3">
                Performance Tracking
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Slow is the new down. Track response times and catch performance issues before they kill conversions.
              </p>
              <a href="#" className="inline-flex items-center text-green-400 font-medium group-hover:gap-2 transition-all">
                Learn More 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section - Soft gray background */}
      <div className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={noti}
                alt="Alert notifications"
                className="rounded-xl shadow-2xl"
              />
            </div>
            <div className="order-1 md:order-2">
              <h4 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get Alerts Where You Already Are
              </h4>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Downtime doesn't wait for you to check your dashboard. We'll alert you on 
                Email, Slack, or WhatsApp, wherever you actually pay attention.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="text-gray-900 font-semibold">Instant Email Alerts</span>
                    <p className="text-gray-600 text-sm">Detailed reports in your inbox</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="text-gray-900 font-semibold">Slack Integration</span>
                    <p className="text-gray-600 text-sm">Notify your whole team instantly</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="text-gray-900 font-semibold">WhatsApp Messages</span>
                    <p className="text-gray-600 text-sm">Get pinged on your phone immediately</p>
                  </div>
                </li>
              </ul>
              <a
                href="/register"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Start Getting Alerts →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials - Dark for Contrast */}
      <div className="bg-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-4">
            Don't Just Take Our Word For It
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Join 1,000+ developers who sleep better at night
          </p>

          {/* Carousel Wrapper */}
          <div className="overflow-hidden relative">
            <div className="flex animate-scroll gap-6 px-1 flex-nowrap">
              {/* First Set */}
              {[
                {
                  text: `I used to check my sites manually every morning. Now Alive Checks does it 1,440 times a day. Game changer.`,
                  name: "Sarah L.",
                  role: "E-commerce Owner",
                },
                {
                  text: `Caught a critical outage at 2 AM before any customer noticed. This tool literally saved my reputation.`,
                  name: "Mark D.",
                  role: "Freelance Developer",
                },
                {
                  text: `Setup took 90 seconds. First alert came 3 hours later. Already worth every penny.`,
                  name: "Emily R.",
                  role: "SaaS Founder",
                },
                {
                  text: `The peace of mind alone is worth it. No more anxiety about 'is my site down?'`,
                  name: "James K.",
                  role: "Agency Owner",
                },
                {
                  text: `Our uptime went from 94% to 99.8% because we could fix issues immediately. Incredible.`,
                  name: "Linda S.",
                  role: "Startup CTO",
                },
                {
                  text: `Best $0/month I've ever spent. Started free, upgraded because I love it so much.`,
                  name: "Robert M.",
                  role: "IT Manager",
                },
              ].map((t, index) => (
                <div
                  key={`first-${index}`}
                  className="bg-gray-800 border border-gray-700 flex-shrink-0 w-[320px] md:w-[380px] p-6 rounded-xl hover:border-blue-500/50 transition"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              ))}

              {/* Duplicate for infinite scroll */}
              {[
                {
                  text: `I used to check my sites manually every morning. Now Alive Checks does it 1,440 times a day. Game changer.`,
                  name: "Sarah L.",
                  role: "E-commerce Owner",
                },
                {
                  text: `Caught a critical outage at 2 AM before any customer noticed. This tool literally saved my reputation.`,
                  name: "Mark D.",
                  role: "Freelance Developer",
                },
                {
                  text: `Setup took 90 seconds. First alert came 3 hours later. Already worth every penny.`,
                  name: "Emily R.",
                  role: "SaaS Founder",
                },
                {
                  text: `The peace of mind alone is worth it. No more anxiety about 'is my site down?'`,
                  name: "James K.",
                  role: "Agency Owner",
                },
                {
                  text: `Our uptime went from 94% to 99.8% because we could fix issues immediately. Incredible.`,
                  name: "Linda S.",
                  role: "Startup CTO",
                },
                {
                  text: `Best $0/month I've ever spent. Started free, upgraded because I love it so much.`,
                  name: "Robert M.",
                  role: "IT Manager",
                },
              ].map((t, index) => (
                <div
                  key={`second-${index}`}
                  className="bg-gray-800 border border-gray-700 flex-shrink-0 w-[320px] md:w-[380px] p-6 rounded-xl hover:border-blue-500/50 transition"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA - Bold Gradient */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Stop Worrying?
          </h2>
          <p className="text-blue-100 text-xl mb-10 leading-relaxed">
            Start monitoring in 30 seconds. No credit card. No catch. <br />
            Just peace of mind.
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-2xl"
          >
            Get Started Free →
          </a>
          <p className="text-blue-200 text-sm mt-6">
            Join 1,000+ developers who sleep better at night
          </p>
        </div>
      </div>

      {/* Footer - Dark */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={frame} alt="Alive Checks" className="w-8 h-8" />
              <span className="text-white font-semibold">Alive Checks</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Alive Checks. Keeping the internet online.
            </p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link to="#" className="hover:text-white transition">Privacy</Link>
              <Link to="#" className="hover:text-white transition">Terms</Link>
              <Link to="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;