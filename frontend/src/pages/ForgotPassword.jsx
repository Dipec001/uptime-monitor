import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestPasswordReset(email);
    alert(`Password reset link sent to ${email} (demo).`);
    navigate("/reset-password"); // redirect after submit
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-2 pt-10">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 flex items-center gap-1"
      >
        ← Back
      </button>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg w-96 mt-10"
      >
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        <p className="mb-4 text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
