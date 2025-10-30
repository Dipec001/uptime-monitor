// src/Login.jsx
import React, { useState } from "react";
import { login, socialAuth } from "../services/Api";
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
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-none md:shadow-md p-4">
        <h2 className="mb-3 text-center font-bold text-lg text-gray-800">
          <span className="text-blue-600">Welcome</span> Back!
        </h2>
        
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-1.5 px-4 rounded-lg hover:bg-blue-700 font-medium transition text-sm mt-3 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Remember Me + Forgot Password Row */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          
          {/* Remember Me */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3 h-3 accent-gray-600 rounded-sm"
              disabled={loading}
            />
            <span>Remember me</span>
          </label>

          {/* Forgot Password */}
          <a
            href="/forgot-password"
            className="text-blue-600 hover:underline font-medium"
          >
            Forgot Password?
          </a>
        </div>


        <div className="mt-3 space-y-2">
          <button 
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-1.5 px-4 rounded-lg hover:bg-gray-50 font-medium transition text-sm flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <img src={googleIcon} alt="Google" className="w-4 h-4" />
            Sign in with Google
          </button>
          <button 
            onClick={handleGithubLogin}
            className="w-full border border-gray-300 py-1.5 px-4 rounded-lg hover:bg-gray-50 font-medium transition text-sm flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <img src={githubIcon} alt="GitHub" className="w-4 h-4" />
            Sign in with GitHub
          </button>
        </div>

        <p className="text-xs text-center text-gray-600 mt-6">
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