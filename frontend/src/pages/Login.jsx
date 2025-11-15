// src/Login.jsx
import React, { useState } from "react";
import { login, socialAuth } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle, loginWithGithub } from '../utils/oauth';
import googleIcon from '../assets/Google.svg';
import githubIcon from '../assets/GitHub.svg';
import unionLogo from "@/assets/UnionLogo.svg";
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login(email, password, rememberMe);
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { accessToken, provider } = await loginWithGoogle();
      const data = await socialAuth(provider, accessToken);

      console.log(data)
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      setError(error.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { accessToken, provider } = await loginWithGithub()
      const data = await socialAuth(provider, accessToken);
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("GitHub login failed:", error);
      setError(error.message || "GitHub login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <Link to="/" className="block">
            <img
              src={unionLogo}
              alt="Alive Checks logo"
              className="mb-6 w-12 h-12 mx-auto transition-transform duration-200 hover:scale-110 cursor-pointer"
            />
          </Link>
          
          <h2 className="mb-2 text-center font-bold text-3xl text-white">
            Welcome Back
          </h2>
          <p className="text-center text-gray-400 mb-6">
            Sign in to continue monitoring
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me + Forgot Password Row */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>

              <a  
                href="/forgot-password"
                className="text-blue-400 hover:text-blue-300 font-medium transition"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition shadow-lg shadow-blue-600/30 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              className="w-full border border-gray-600 bg-gray-700/50 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium transition flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <button 
              onClick={handleGithubLogin}
              className="w-full border border-gray-600 bg-gray-700/50 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium transition flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <img src={githubIcon} alt="GitHub" className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>

          <p className="text-sm text-center text-gray-400 mt-8">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;