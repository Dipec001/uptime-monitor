import { useState } from "react";
import { useNavigate } from "react-router-dom";
import unionLogo from '@/assets/UnionLogo.svg';
import plusCircle from "@/assets/PlusCircle.svg";
import StepIndicator from "@/components/StepIndicator";
import { createBulkWebsites } from "../../../services/api";

export default function StepSites({ sites, setSites, onNext }) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const addSite = () => {
    if (!url.trim()) return;
    setSites([...sites, { url }]);
    setUrl("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSite();
    }
  };

  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      <img src={unionLogo} alt="alive checks logo" className="mb-6 w-12 h-12" />

      <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome to Alive Checks</h2>
      <p className="mt-2 text-sm sm:text-base text-gray-400">
        Let's get started by adding your first website(s) to monitor.
      </p>

      <div className={`w-full bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 sm:p-8 mt-6 shadow-2xl`}>
        {/* Steps Indicator */}
        <StepIndicator currentStep={1} totalSteps={3} />

        {/* Content Container */}
        <div className="mt-8">
          <h3 className="text-base sm:text-lg text-white font-semibold mb-4 text-left">
            Which websites do you want to monitor?
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 text-left uppercase tracking-wide">
                Website URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="flex-1 bg-gray-700 text-white border border-gray-600 px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                  onClick={addSite}
                  disabled={!url.trim()}
                >
                  <img src={plusCircle} alt="Add" className="w-4 h-4 invert" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            {/* Sites List */}
            {sites.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-gray-400 mb-3 text-left">
                  {sites.length} website{sites.length !== 1 ? 's' : ''} added
                </p>
                <ul className="space-y-2">
                  {sites.map((s, i) => (
                    <li 
                      key={i} 
                      className="bg-gray-700/50 border border-gray-600 p-3 rounded-lg flex justify-between items-center hover:border-gray-500 transition group"
                    >
                      <span className="text-sm text-gray-200 truncate flex-1">{s.url}</span>
                      <button
                        className="ml-3 text-red-400 hover:text-red-300 text-lg transition opacity-0 group-hover:opacity-100"
                        onClick={() => setSites(sites.filter((_, index) => index !== i))}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sites.length === 0 && (
              <div className="mt-6 p-8 border-2 border-dashed border-gray-700 rounded-lg">
                <p className="text-gray-500 text-sm">
                  No websites added yet. Add at least one to continue.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full grid grid-cols-3 items-center mt-8 gap-4">
        <div></div>

        <button
          className="justify-self-center text-sm text-gray-400 hover:text-gray-300 transition"
          onClick={() => navigate("/dashboard")}
        >
          Skip for now
        </button>

        <button
          className="justify-self-end bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-700 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-600/30"
          disabled={sites.length === 0 || loading}
          onClick={async () => {
            try {
              setLoading(true);
              await createBulkWebsites(sites);
              onNext();
            } catch (error) {
              console.error(error);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
}