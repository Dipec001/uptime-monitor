import { useState, useEffect } from "react";
import StepSites from "./steps/StepSites";
import StepAlerts from "./steps/StepAlerts";
import StepFinished from "./steps/StepFinished";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem("onboarding_complete") === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [currentStep, setCurrentStep] = useState(() => {
    return Number(localStorage.getItem("onboarding_step")) || 1;
  });

  const [sites, setSites] = useState(() => {
    const saved = localStorage.getItem("onboarding_sites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("onboarding_sites", JSON.stringify(sites));
    localStorage.setItem("onboarding_step", currentStep);
  }, [sites, currentStep]);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 py-8 px-4">
        {currentStep === 1 && (
          <StepSites
            sites={sites}
            setSites={setSites}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepAlerts
            sites={sites}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && <StepFinished />}
      </div>
    </div>
  );
}