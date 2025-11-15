import { useState } from "react";
import { useNavigate } from "react-router-dom";
import unionLogo from "@/assets/UnionLogo.svg";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle, sending, success, error
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("sending");

    try {
      // Replace with your actual API endpoint
      const response = await fetch("http://127.0.0.1:8000/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (status !== "idle") setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Navbar */}
      <nav className="relative z-50 px-6 md:px-12 py-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={unionLogo} alt="Alive Checks" className="w-10 h-10" />
            <span className="text-white font-bold text-xl">Alive Checks</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Let's Talk! 💬
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Got questions? Found a bug? Just wanna say hi? We're all ears! 
            (Well, technically we're all code, but you get the idea)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email Us</h3>
                  <p className="text-gray-400 text-sm mb-2">We usually reply within 24 hours (or during our next coffee break ☕)</p>
                  <a href="mailto:hello@alivechecks.com" className="text-blue-400 hover:text-blue-300 transition">
                    info@alivechecks.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-green-500/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Call Us</h3>
                  <p className="text-gray-400 text-sm mb-2">Ring ring! We promise not to put you on hold for eternity 📞</p>
                  <a href="tel:+2348012345678" className="text-green-400 hover:text-green-300 transition">
                    +234 8147250442
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Follow Us</h3>
                  <p className="text-gray-400 text-sm mb-3">Join our community of people who like their websites alive!</p>
                  <div className="flex gap-3">
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Fun Fact Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur border border-blue-500/30 rounded-2xl p-6">
              <p className="text-blue-300 text-sm">
                <span className="text-2xl">💡</span> <strong>Fun fact:</strong> Our servers have 99.9% uptime. 
                The 0.1% is when we're teaching them to make coffee. They're still learning ☕
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
            <p className="text-gray-400 text-sm mb-6">Or as we like to call it: "Shoot us a digital paper airplane ✈️"</p>

            {status === "success" && (
              <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg animate-fade-in">
                <p className="font-semibold">🎉 Message sent successfully!</p>
                <p className="text-sm mt-1">We'll get back to you faster than you can say "uptime monitoring"!</p>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg animate-fade-in">
                <p className="font-semibold">😅 Oops! Something went wrong.</p>
                <p className="text-sm mt-1">Our hamsters might be sleeping. Try again in a moment!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name <span className="text-gray-500">(We promise not to steal it)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500">(So we can reply, duh)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  placeholder="you@awesome.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject <span className="text-gray-500">(What's this about?)</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  placeholder="My website is more alive than ever!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message <span className="text-gray-500">(Spill the tea ☕)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none"
                  placeholder="Tell us everything... or just what's important. We're cool either way 😎"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-600/30 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending your message to the cloud...
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="text-xl">🚀</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Fun Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Response time: Usually faster than your website's ping ⚡
          </p>
        </div>
      </div>
    </div>
  );
}