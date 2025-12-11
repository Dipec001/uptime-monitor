import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import frame from "../assets/Frame.svg";

function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <nav className="relative z-50 px-6 md:px-12 py-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={frame} alt="Alive Checks" className="w-10 h-10" />
            <span className="text-white font-bold text-xl">Alive Checks</span>
          </Link>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: December 11, 2025</p>

        <div className="space-y-6">
          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Alive Checks ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our uptime monitoring service.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Account Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
              <li>Email address</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Monitoring Data</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              To provide our monitoring service, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
              <li>URLs of websites and APIs you monitor</li>
              <li>HTTP response codes and response times</li>
              <li>Uptime/downtime events and timestamps</li>
              <li>Alert history and notification preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>IP address and browser information</li>
              <li>Pages visited and features used</li>
              <li>Login times and activity logs</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide and maintain our monitoring services</li>
              <li>Send you alerts about your monitored sites</li>
              <li>Improve and optimize our platform</li>
              <li>Communicate with you about service updates</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong className="text-white">Service Providers:</strong> We use trusted third-party services (email delivery, hosting) that may process your data on our behalf</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
              <li><strong className="text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure password hashing</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Export your monitoring data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar technologies to maintain your session and improve your experience. You can control cookies through your browser settings, though disabling them may affect functionality.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our service integrates with third-party platforms (Slack, email providers) to deliver alerts. Please review their privacy policies as well:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Slack Privacy Policy</li>
              <li>AWS Privacy Notice (for hosting and email delivery)</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our service is not intended for users under 18 years of age. We do not knowingly collect information from children.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or through the service. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-blue-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or your data, please contact us:
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:info@alivechecks.com" className="text-blue-400 hover:text-blue-300 transition">
                  info@alivechecks.com
                </a>
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Contact Us:</strong>{' '}
                <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition">
                  Here
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-800/50 border-t border-gray-800 py-8 px-6 mt-16">
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
              <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;