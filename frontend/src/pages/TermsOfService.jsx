import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import frame from "../assets/Frame.svg";

function TermsOfService() {
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
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: December 11, 2025</p>

        <div className="space-y-6">
          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using Alive Checks ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Service.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Alive Checks provides uptime monitoring and alerting services for websites, APIs, and scheduled tasks (heartbeat monitoring). Our service includes:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Website and API uptime monitoring</li>
              <li>Heartbeat/cron job monitoring</li>
              <li>Performance tracking and response time monitoring</li>
              <li>Alert notifications via email and third-party integrations</li>
              <li>Historical data and analytics</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Beta Access</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Alive Checks is currently in Early Access Beta. During this period:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>The service is provided free of charge</li>
              <li>Features and functionality may change without notice</li>
              <li>Service availability is provided on a "best effort" basis</li>
              <li>We may impose usage limits or restrictions at any time</li>
              <li>Beta access may be terminated at our discretion</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">Account Registration</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              To use our Service, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>Be at least 18 years of age</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">Account Responsibility</h3>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized access or security breach.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Use the Service to monitor sites you don't own or have permission to monitor</li>
              <li>Attempt to disrupt or interfere with the Service</li>
              <li>Use automated means to access the Service beyond normal usage</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Monitor illegal content or use the Service for illegal purposes</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Service Availability</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              While we strive for high availability:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>We do not guarantee uninterrupted access to the Service</li>
              <li>Maintenance windows may occur with or without notice</li>
              <li>We are not liable for monitoring failures or missed alerts</li>
              <li>Service availability targets may vary by plan (when paid plans launch)</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data and Privacy</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Your use of the Service is also governed by our{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition underline">
                Privacy Policy
              </Link>
              . Key points:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>We collect and store monitoring data and account information</li>
              <li>You retain ownership of your data</li>
              <li>We may use aggregated, anonymized data for analytics and improvements</li>
              <li>You can export or delete your data at any time</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service, including all content, features, and functionality, is owned by Alive Checks and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Service integrates with third-party platforms (Slack, email providers, etc.). Your use of these integrations is subject to their respective terms and privacy policies. We are not responsible for third-party services.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-yellow-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
            <div className="bg-yellow-900/30 border border-yellow-700/50 p-6 rounded-lg mb-4">
              <p className="text-yellow-400 leading-relaxed font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Alive Checks provides the Service "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li>Accuracy or reliability of monitoring data</li>
              <li>Timely delivery of alerts</li>
              <li>Prevention of downtime for monitored sites</li>
              <li>Uninterrupted or error-free service</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              IN NO EVENT SHALL ALIVE CHECKS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, REVENUE, OR DATA, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to indemnify and hold harmless Alive Checks from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Termination</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li>Suspend or terminate your account for violations of these Terms</li>
              <li>Discontinue the Service at any time with reasonable notice</li>
              <li>Modify or remove features during the beta period</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              You may terminate your account at any time by contacting us or deleting your account through the dashboard.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Future Pricing</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              When we transition from beta to paid plans:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Early access users will receive advance notice of pricing changes</li>
              <li>We may offer special pricing to beta users</li>
              <li>Free tier options may remain available with usage limits</li>
              <li>You will have the option to accept new pricing or cancel your account</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">15. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms are governed by the laws of Nigeria. Any disputes shall be resolved in the courts of Nigeria.
            </p>
          </section>

          <section className="bg-gray-800/50 backdrop-blur border border-blue-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">16. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For questions about these Terms, please contact us:
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

          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
            <p className="text-gray-200 leading-relaxed">
              <strong className="text-white">By using Alive Checks, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
          </div>
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

export default TermsOfService;