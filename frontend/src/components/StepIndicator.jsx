export default function StepIndicator({ currentStep = 1, totalSteps = 3 }) {
  const labels = ["Websites", "Alerts", "Done"];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 select-none">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center gap-2">
            {/* Step Circle */}
            <div
              className={`
                flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-semibold
                transition-all
                ${isCompleted ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50" : ""}
                ${isCurrent ? "bg-blue-600/20 border-2 border-blue-500 text-blue-400" : ""}
                ${!isCompleted && !isCurrent ? "bg-gray-700/50 border-2 border-gray-600 text-gray-500" : ""}
              `}
            >
              {isCompleted ? "✓" : stepNumber}
            </div>

            {/* Label (hidden on mobile) */}
            <span
              className={`
                hidden sm:inline text-sm font-medium
                ${isCompleted ? "text-blue-400" : ""}
                ${isCurrent ? "text-blue-400" : "text-gray-500"}
              `}
            >
              {labels[index]}
            </span>

            {/* Dotted line (except last step) */}
            {stepNumber !== totalSteps && (
              <div className="w-6 sm:w-10 border-t-2 border-dotted border-gray-700 mx-1 sm:mx-2"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}