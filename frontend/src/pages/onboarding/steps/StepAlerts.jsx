import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import unionLogo from "@/assets/UnionLogo.svg";
import useFadeIn from "@/hooks/useFadeIn";
import { useNavigate } from "react-router-dom";
import { createBulkPreferences, testEmailOnly } from "../../../services/api";

export default function StepAlerts({ sites, onBack, onNext }) {
  const fade = useFadeIn();
  const navigate = useNavigate();

  const handleTestEmail = async () => {
    if (!email.trim()) return;

    try {
      setTesting(true);
      await testEmailOnly(email);
      setTestStatus("success");
    } catch (err) {
      console.error(err);
      setTestStatus("error");
    } finally {
      setTesting(false);
    }
  };

  const [email, setEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState("idle");

  return (
    <div className="flex flex-col items-center text-center py-2">
      <img src={unionLogo} alt="alive checks logo" className="mb-6 w-10 h-10" />

      <h2 className="text-xl font-semibold text-gray-800">Welcome To Alive Checks</h2>
      <p className="mt-1 text-sm text-gray-500">
        Tell us where we should notify you if a website goes down.
      </p>
      
      <div className={`onboarding-card w-full max-w-md bg-white rounded-lg shadow-2xl p-4 mt-4 ${fade}`}>
        {/* Steps Indicator */}
        <StepIndicator currentStep={2} totalSteps={3} />

        {/* Content */}
        <div className="relative w-full max-w-md bg-white text-left mt-6">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Send Alert to this contact
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            // onChange={(e) => setEmail(e.target.value)}
            onChange={(e) => {
              setEmail(e.target.value);
              setTestStatus("idle");  // Reset test result when typing changes
            }}
          />

          <button
            disabled={!email.trim() || !sites?.length || testing}
            onClick={handleTestEmail}
            className={`absolute right-1 top-7 text-xs px-2 py-1 rounded transition 
              ${testStatus === "success" ? "bg-green-500 text-white" :
                testStatus === "error" ? "bg-red-500 text-white" :
                "bg-gray-200 hover:bg-gray-300"}`}
          >
            {testing ? "..." : testStatus === "success" ? "✓ Tested" : "Test"}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full max-w-md grid grid-cols-3 items-center mt-6">
        <button
          className="justify-self-start text-xs text-gray-500 hover:text-gray-700"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          className="justify-self-center text-xs text-gray-500 underline hover:text-gray-700"
          onClick={() => navigate("/dashboard")}
        >
          Skip
        </button>

        <button
          className="justify-self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          disabled={!email.trim()}
          onClick={async () => {
            try {
              await createBulkPreferences(
                "website",                    // model type
                sites.map(site => site.id),   // list of website IDs
                "email",                      // notification method
                email                         // where alerts should go
              );
              onNext();  // ✅ move to Step 3
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
