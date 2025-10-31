import { useState } from "react";
import { useNavigate } from "react-router-dom";
import unionLogo from '@/assets/UnionLogo.svg';
import plusCircle from "@/assets/PlusCircle.svg";
import StepIndicator from "@/components/StepIndicator";
import useFadeIn from "@/hooks/useFadeIn";
import { createBulkWebsites } from "../../../services/api";


export default function StepSites({ sites, setSites, onNext }) {
  const navigate = useNavigate();
  const fade = useFadeIn();

  const [url, setUrl] = useState("");

  const addSite = () => {
    if (!url.trim()) return;
    setSites([...sites, { url }]);
    setUrl("");
  };

  return (
    <div className="flex flex-col items-center text-center mx-2 md:mx-0">
      <img src={unionLogo} alt="alive checks logo" className="mb-6 w-10 h-10" />

      <h2 className="text-xl font-semibold text-gray-800">Welcome to Alive Checks</h2>
      <p className="mt-1 text-sm text-gray-500">
        Let's get started by adding your first website(s) to monitor.
      </p>

      <div className={`onboarding-card w-full max-w-md bg-white rounded-lg shadow-2xl p-4 mt-4 ${fade}`}>
        {/* Steps Indicator */}
        <StepIndicator currentStep={1} totalSteps={3} />

        {/* Content Container */}
        <div className="mt-6 bg-white">
            <h3 className="text-sm text-gray-700 font-medium mb-3">
            Which websites do you want to monitor?
            </h3>

            <div className="flex flex-col items-start space-y-3">
            <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
              WEBSITE URL
            </label>
            <input
                type="text"
                placeholder="https://"
                className=" w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />

            <button
                className="px-3 py-2 text-sm border border-blue-600 text-blue-600 rounded-xl 
             hover:bg-blue-600 hover:text-white transition flex justify-center items-center gap-1"
                onClick={addSite}
            >
                <img src={plusCircle} alt="Plus Circle" className="w-3 h-3 group-hover:invert" />
                Add
            </button>
            </div>

            <ul className="mt-4 space-y-1 text-left">
              {sites.map((s, i) => (
                <li 
                  key={i} 
                  className="text-sm text-gray-700 bg-gray-50 p-2 rounded border flex justify-between items-center"
                >
                  <span>{s.url}</span>

                  <button
                    className="text-red-500 text-xs hover:text-red-700"
                    onClick={() => setSites(sites.filter((_, index) => index !== i))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full max-w-md grid grid-cols-3 items-center mt-6">
        <div></div> {/* Left placeholder */}

        <button
          className="justify-self-center text-xs text-gray-500 underline hover:text-gray-700"
          onClick={() => navigate("/dashboard")}
        >
          Skip Onboarding
        </button>

        <button
          className="justify-self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          disabled={sites.length === 0}
          onClick={async () => {
            try {
              await createBulkWebsites(sites);
              onNext();  // ✅ move to Step 2
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