import React, { useEffect } from 'react';

const FeatureModal = ({ isOpen, onClose, feature }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getFeatureContent = () => {
    switch (feature) {
      case 'website':
        return {
          title: 'Website Monitoring Explained',
          color: 'blue',
          content: (
            <>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Website monitoring is the foundation of uptime tracking. We send HTTP/HTTPS requests to your website or API endpoint every minute to ensure it's responding correctly.
              </p>
              <div className="bg-blue-500/10 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <h4 className="text-xl font-semibold text-white mb-4">What We Check:</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">HTTP Status Codes:</strong> We verify your site returns successful responses (200, 201, etc.)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">Response Time:</strong> Track how fast your site loads for real users
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">SSL Certificate:</strong> Get notified before your SSL expires
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">Keyword Monitoring:</strong> Ensure specific content appears on your pages
                    </div>
                  </li>
                </ul>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Perfect for monitoring production websites, APIs, e-commerce stores, landing pages, and any web service that needs to stay online 24/7.
              </p>
            </>
          ),
        };
      
      case 'heartbeat':
        return {
          title: 'Heartbeat Monitoring Explained',
          color: 'purple',
          content: (
            <>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Heartbeat monitoring (also called cron job monitoring) works differently than website monitoring. Instead of us checking your service, <strong className="text-white">your service reports to us</strong> that it's still alive.
              </p>
              <div className="bg-purple-500/10 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
                <h4 className="text-xl font-semibold text-white mb-4">How It Works:</h4>
                <ol className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                    <span className="pt-1">You create a heartbeat monitor and get a unique ping URL</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                    <span className="pt-1">Your background job/script calls this URL when it runs successfully</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                    <span className="pt-1">If we don't receive a ping within the expected timeframe, we alert you</span>
                  </li>
                </ol>
              </div>
              <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Common Use Cases:</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <div><strong className="text-white">Database Backups:</strong> Ensure nightly backups complete successfully</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <div><strong className="text-white">Data Imports:</strong> Monitor ETL jobs and data synchronization</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <div><strong className="text-white">Report Generation:</strong> Track scheduled report creation tasks</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <div><strong className="text-white">Server Maintenance:</strong> Verify cleanup scripts and maintenance tasks run</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <div><strong className="text-white">API Integrations:</strong> Monitor webhook processors and API sync jobs</div>
                  </li>
                </ul>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Think of it as a "dead man's switch" for your critical background processes. If your job fails or hangs, you'll know immediately instead of discovering it days later.
              </p>
            </>
          ),
        };
      
      case 'performance':
        return {
          title: 'Performance Tracking Explained',
          color: 'green',
          content: (
            <>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Your website might be "up" but if it takes 10 seconds to load, users will leave. Performance tracking helps you catch slow response times before they impact your business.
              </p>
              <div className="bg-green-500/10 border-l-4 border-green-500 p-6 rounded-lg mb-6">
                <h4 className="text-xl font-semibold text-white mb-4">What We Measure:</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">Response Time:</strong> How long it takes for your server to respond (measured in milliseconds)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">Trends Over Time:</strong> See if your site is getting slower as traffic grows
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">Geographic Performance:</strong> Track how fast your site loads from different regions
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-white">Performance Alerts:</strong> Get notified when response times exceed your threshold
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Why This Matters:
                </h4>
                <p className="text-gray-300">
                  Studies show that a 1-second delay in page load time can result in 7% fewer conversions. 
                  53% of mobile users abandon sites that take longer than 3 seconds to load. Performance 
                  monitoring helps you maintain the speed your users expect.
                </p>
              </div>
            </>
          ),
        };
      
      default:
        return null;
    }
  };

  const featureData = getFeatureContent();
  if (!featureData) return null;

  const colorClasses = {
    blue: {
      border: 'border-blue-500/50',
      gradient: 'from-blue-600/20 to-blue-800/20',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30',
      closeHover: 'hover:bg-blue-500/20',
    },
    purple: {
      border: 'border-purple-500/50',
      gradient: 'from-purple-600/20 to-purple-800/20',
      button: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30',
      closeHover: 'hover:bg-purple-500/20',
    },
    green: {
      border: 'border-green-500/50',
      gradient: 'from-green-600/20 to-green-800/20',
      button: 'bg-green-600 hover:bg-green-700 shadow-green-600/30',
      closeHover: 'hover:bg-green-500/20',
    },
  };

  const colors = colorClasses[featureData.color];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`relative bg-gray-900 border ${colors.border} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-gray-400 ${colors.closeHover} rounded-lg p-2 transition-colors z-10`}
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with gradient */}
        <div className={`bg-gradient-to-br ${colors.gradient} border-b border-gray-800 p-8`}>
          <h3 className="text-3xl md:text-4xl font-bold text-white pr-12">
            {featureData.title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-8">
          {featureData.content}
          
          {/* Action button */}
          <div className="mt-8 text-center">
            <a
              href="/register"
              className={`inline-block ${colors.button} text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg`}
            >
              Start Monitoring Free →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;