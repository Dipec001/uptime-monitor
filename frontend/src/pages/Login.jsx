// src/Login.jsx
import React, { useState } from "react";
import { login, socialAuth } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle, loginWithGithub } from '../utils/oauth';
import googleIcon from '../assets/Google.svg';
import githubIcon from '../assets/GitHub.svg';

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
    <div className="min-h-screen bg-white p-6 flex justify-center">
      <div className="w-full max-w-md shadow-none md:shadow-md md:p-4">
        <h2 className="mb-6 mt-6 text-center font-bold text-2xl text-gray-800">
          <span className="text-blue-600">Welcome</span> back!
        </h2>
        
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 md:py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 md:py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Remember Me + Forgot Password Row */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-gray-600 rounded-sm"
                disabled={loading}
              />
              <span>Remember me</span>
            </label>

            
            <a  href="/forgot-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 md:py-1 px-4 rounded-lg hover:bg-blue-700 font-medium transition text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 space-y-3">
          <button 
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-3 md:py-1 px-4 rounded-lg hover:bg-gray-50 font-medium transition text-sm flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <img src={googleIcon} alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          <button 
            onClick={handleGithubLogin}
            className="w-full border border-gray-300 py-3 md:py-1 px-4 rounded-lg hover:bg-gray-50 font-medium transition text-sm flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <img src={githubIcon} alt="GitHub" className="w-5 h-5" />
            Sign in with GitHub
          </button>
        </div>

        <p className="text-sm text-center text-gray-600 mt-8">
          No account yet?{" "}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;