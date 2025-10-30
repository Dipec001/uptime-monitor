import { useState } from "react";
import StepSites from "./steps/StepSites";
import StepAlerts from "./steps/StepAlerts";
import StepFinished from "./steps/StepFinished";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sites, setSites] = useState([]);

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
