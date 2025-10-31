import { useNavigate } from "react-router-dom";
import StepIndicator from "@/components/StepIndicator";
import smileyFrame from "@/assets/SmileyFrame.svg";
import unionLogo from '@/assets/UnionLogo.svg';
import useFadeIn from "@/hooks/useFadeIn";


export default function StepFinished() {
  const navigate = useNavigate();
  const fade = useFadeIn();

  return (
    <div className="flex flex-col items-center text-center py-2 mx-2 md:mx-0">
      {/* Logo & Header spacing stays consistent */}
      <img src={unionLogo} alt="alive checks logo" className="mb-6 w-10 h-10" />
      
      <h2 className="text-xl font-semibold text-gray-800">Welcome to Alive Checks</h2>
      <p className="mt-1 text-sm text-gray-500">
        You are all set.
      </p>
      
      <div className={`onboarding-card w-full bg-white rounded-lg shadow-2xl p-4 mt-4 max-w-md flex flex-col items-center text-center ${fade}`}>
        {/* Steps Indicator */}
        <StepIndicator currentStep={3} totalSteps={3} />

        {/* Success Icon */}
        <img src={smileyFrame} alt="steps finished" className="w-20 h-20 my-8 mx-auto" />


        <h1 className="text-xl font-semibold text-gray-800">Great Job 🎉</h1>

        <p className="mt-2 text-gray-500">
          You're all set! We’ve started monitoring your websites and will notify
          you if anything goes wrong.
        </p>
      </div>

      {/* Final Button */}
      <button
        onClick={() => {
          localStorage.setItem("onboarding_complete", "true");
          localStorage.removeItem("onboarding_sites");
          localStorage.removeItem("onboarding_step");
          navigate("/dashboard")
        }}
        className="mt-6 w-full max-w-md bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
