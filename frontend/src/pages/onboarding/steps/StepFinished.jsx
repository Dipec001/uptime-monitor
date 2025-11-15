import { useNavigate } from "react-router-dom";
import StepIndicator from "@/components/StepIndicator";
import smileyFrame from "@/assets/SmileyFrame.svg";
import unionLogo from '@/assets/UnionLogo.svg';

export default function StepFinished() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      <img src={unionLogo} alt="alive checks logo" className="mb-6 w-12 h-12" />
      
      <h2 className="text-2xl sm:text-3xl font-bold text-white">You're All Set!</h2>
      <p className="mt-2 text-sm sm:text-base text-gray-400">
        Your monitoring is now active.
      </p>
      
      <div className={`w-full bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 sm:p-8 mt-6 shadow-2xl flex flex-col items-center`}>
        {/* Steps Indicator */}
        <StepIndicator currentStep={3} totalSteps={3} />

        {/* Success Icon - Enhanced visibility */}
        <div className="my-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-full flex items-center justify-center border-2 border-green-500/50 shadow-2xl">
            <img src={smileyFrame} alt="Success" className="w-20 h-20 drop-shadow-2xl" style={{ filter: 'brightness(1.2) contrast(1.1)' }} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Great Job! 🎉</h1>

        <p className="text-gray-300 text-base max-w-md leading-relaxed">
          You're all set! We've started monitoring your websites and will notify you instantly if anything goes wrong.
        </p>

        {/* Features list */}
        <div className="mt-8 w-full space-y-3">
          <div className="flex items-start gap-3 bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 hover:border-green-500/30 transition">
            <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="text-white font-semibold">24/7 Monitoring Active</p>
              <p className="text-gray-400 text-sm">We're checking your sites every minute</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 hover:border-blue-500/30 transition">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div className="text-left">
              <p className="text-white font-semibold">Instant Email Alerts</p>
              <p className="text-gray-400 text-sm">Get notified the moment something breaks</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 hover:border-purple-500/30 transition">
            <svg className="w-6 h-6 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <div className="text-left">
              <p className="text-white font-semibold">Performance Tracking</p>
              <p className="text-gray-400 text-sm">Monitor response times and uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Button */}
      <button
        onClick={() => {
          localStorage.setItem("onboarding_complete", "true");
          localStorage.removeItem("onboarding_sites");
          localStorage.removeItem("onboarding_step");
          navigate("/dashboard")
        }}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-600/30"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}