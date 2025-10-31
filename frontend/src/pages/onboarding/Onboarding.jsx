import { useState, useEffect } from "react";
import StepSites from "./steps/StepSites";
import StepAlerts from "./steps/StepAlerts";
import StepFinished from "./steps/StepFinished";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  // redirect if onboarding done
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

  // Sync to localStorage whenever something changes
  useEffect(() => {
    localStorage.setItem("onboarding_sites", JSON.stringify(sites));
    localStorage.setItem("onboarding_step", currentStep);
  }, [sites, currentStep]);

  return (
    <div className="bg-gray-50 mx-auto py-4">
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
  );
}
