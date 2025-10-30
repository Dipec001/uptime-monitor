import { useNavigate } from "react-router-dom";
import StepIndicator from "@/components/StepIndicator";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function StepFinished() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center py-2">
      {/* Logo & Header spacing stays consistent */}
      
      <div className="w-full bg-white rounded-lg shadow-2xl p-6 max-w-md">
        {/* Steps Indicator */}
        <StepIndicator currentStep={3} totalSteps={3} />

        {/* Success Icon */}
        <CheckCircleIcon className="w-14 h-14 text-blue-600 my-6" />


        <h1 className="text-xl font-semibold text-gray-800">Great Job 🎉</h1>

        <p className="mt-2 text-gray-500">
          You're all set! We’ve started monitoring your websites and will notify
          you if anything goes wrong.
        </p>
      </div>

      {/* Final Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 w-full max-w-md bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
