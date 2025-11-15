import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import unionLogo from "@/assets/UnionLogo.svg";
import { useNavigate } from "react-router-dom";
import { createBulkPreferences, testEmailOnly } from "../../../services/api";

export default function StepAlerts({ sites, onBack, onNext }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTestEmail = async () => {
    if (!email.trim()) return;

    try {
      setTesting(true);
      setTestStatus("testing");
      await testEmailOnly(email);
      setTestStatus("success");
    } catch (err) {
      console.error(err);
      setTestStatus("error");
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate email before submitting
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Check if we have sites with IDs
      if (!sites || sites.length === 0) {
        setError("No websites found. Please go back and add websites first.");
        setLoading(false);
        return;
      }

      // Make sure all sites have IDs (they should after step 1)
      const siteIds = sites.map(site => site.id).filter(id => id);
      if (siteIds.length === 0) {
        setError("Website IDs are missing. Please go back and try adding websites again.");
        setLoading(false);
        return;
      }

      const response = await createBulkPreferences(
        "website",
        siteIds,
        "email",
        email
      );

      // Check if there were any errors
      if (response.errors && response.errors.length > 0) {
        const firstError = response.errors[0];
        const errorMessage = firstError.errors?.target?.[0] || 
                           firstError.errors?.method?.[0] ||
                           firstError.errors?.object_id?.[0] ||
                           firstError.errors?.non_field_errors?.[0] ||
                           "Some notification preferences failed to save";
        setError(errorMessage);
        return;
      }

      // Success!
      onNext();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save notification preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      <img src={unionLogo} alt="alive checks logo" className="mb-6 w-12 h-12" />

      <h2 className="text-2xl sm:text-3xl font-bold text-white">Setup Notifications</h2>
      <p className="mt-2 text-sm sm:text-base text-gray-400">
        Tell us where we should notify you if a website goes down.
      </p>
      
      <div className="w-full bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 sm:p-8 mt-6 shadow-2xl">
        {/* Steps Indicator */}
        <StepIndicator currentStep={2} totalSteps={3} />

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          <h3 className="text-base sm:text-lg text-white font-semibold mb-4 text-left">
            Where should we send alerts?
          </h3>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-400 mb-2 text-left uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-gray-700 text-white border border-gray-600 px-4 py-3 pr-32 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTestStatus("idle");
                  setError(""); // Clear error when typing
                }}
              />

              <button
                disabled={!email.trim() || !sites?.length || testing}
                onClick={handleTestEmail}
                className={`absolute right-2 text-xs px-4 py-2 rounded-lg transition-all font-semibold
                  ${testStatus === "testing" ? "bg-blue-600 text-white animate-pulse cursor-wait" :
                    testStatus === "success" ? "bg-green-600 text-white cursor-default" :
                    testStatus === "error" ? "bg-red-600 text-white cursor-pointer" :
                    !email.trim() || !sites?.length ? "bg-gray-600 text-gray-400 cursor-not-allowed" :
                    "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"}`}
              >
                {testStatus === "testing" ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing...
                  </span>
                ) : testStatus === "success" ? (
                  <span className="flex items-center gap-1">
                    ✓ Sent
                  </span>
                ) : testStatus === "error" ? (
                  <span className="flex items-center gap-1">
                    ✗ Failed
                  </span>
                ) : (
                  "Send Test"
                )}
              </button>
            </div>
          </div>

          {testStatus === "success" && (
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 animate-fade-in">
              <p className="text-sm text-green-400 text-left flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Test email sent successfully! Check your inbox.
              </p>
            </div>
          )}

          {testStatus === "error" && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-fade-in">
              <p className="text-sm text-red-400 text-left flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Failed to send test email. Please try again.
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="mt-6 bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300 text-left">
              💡 <strong>Tip:</strong> We'll send you instant alerts via email whenever one of your monitored websites goes down or comes back up.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full grid grid-cols-3 items-center mt-8 gap-4">
        <button
          className="justify-self-start text-sm text-gray-400 hover:text-gray-300 transition flex items-center gap-1"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          className="justify-self-center text-sm text-gray-400 hover:text-gray-300 transition"
          onClick={() => navigate("/dashboard")}
        >
          Skip for now
        </button>

        <button
          className="justify-self-end bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-700 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-600/30"
          disabled={!email.trim() || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
}