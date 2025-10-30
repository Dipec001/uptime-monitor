// src/Register.jsx
import React, { useState } from "react";
import { register, socialAuth } from "../services/Api";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle, loginWithGithub } from '../utils/oauth';
import googleIcon from "../assets/Google.svg";
import githubIcon from "../assets/GitHub.svg";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await register(fullName, email, password);
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/onboarding");
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { accessToken, provider } = await loginWithGoogle();
      const data = await socialAuth(provider, accessToken);
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/onboarding");
    } catch (error) {
      console.error("Google signup failed:", error);
      setError(error.message || "Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { accessToken, provider } = await loginWithGithub(); 
      const data = await socialAuth(provider, accessToken);
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      navigate("/onboarding");
    } catch (error) {
      console.error("GitHub signup failed:", error);
      setError(error.message || "GitHub signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-none md:shadow-md p-4">
        <h2 className="mb-3 text-center font-bold text-lg">
          <span className="block md:inline">Create Your</span>{" "}
          <span>AliveChecks Account</span>
        </h2>

        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

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
              placeholder="Create a password"
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
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-3 space-y-2">
          <button 
            onClick={handleGoogleSignup}
            className="w-full border border-gray-300 py-1.5 px-4 rounded-lg hover:bg-gray-50 font-medium transition text-sm flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <img src={googleIcon} alt="Google" className="w-4 h-4" />
            Sign up with Google
          </button>
          <button 
            onClick={handleGithubSignup}
            className="w-full border border-gray-300 py-1.5 px-4 rounded-lg hover:bg-gray-50 font-medium transition text-sm flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <img src={githubIcon} alt="GitHub" className="w-4 h-4" />
            Sign up with GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{" "}
          
          <a href="/login"
            className="text-blue-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;