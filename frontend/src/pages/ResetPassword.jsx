import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPasswordConfirm } from "../services/api.js";

export default function ResetPassword() {
  const { uid, token } = useParams();  // get from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPasswordConfirm(uid, token, password);
      alert("Password reset successful!");
      navigate("/login"); // redirect to login
    } catch (err) {
      setError("Reset failed. Link may be invalid or expired.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded w-96"
      >
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
