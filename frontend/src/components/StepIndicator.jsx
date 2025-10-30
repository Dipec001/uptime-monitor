export default function StepIndicator({ currentStep = 1, totalSteps = 3 }) {
  const labels = ["Websites", "Alerts", "Done"];

  return (
    <div className="flex items-center justify-center gap-4 mt-6 select-none">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center gap-2">
            {/* Step Circle */}
            <div
              className={`
                flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium
                transition-all
                ${isCompleted ? "bg-blue-600 text-white" : ""}
                ${isCurrent ? "border-2 border-blue-600 text-blue-600" : ""}
                ${!isCompleted && !isCurrent ? "border-2 border-gray-400 text-gray-400" : ""}
              `}
            >
              {isCompleted ? "✓" : stepNumber}
            </div>

            {/* Label (hidden on mobile) */}
            <span
              className={`
                hidden md:inline text-sm font-medium
                ${isCompleted ? "text-blue-600" : ""}
                ${isCurrent ? "text-blue-600" : "text-gray-500"}
              `}
            >
              {labels[index]}
            </span>

            {/* Dotted line (except last step) */}
            {stepNumber !== totalSteps && (
              <div className="w-10 border-t-2 border-dotted border-gray-300 mx-2"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
