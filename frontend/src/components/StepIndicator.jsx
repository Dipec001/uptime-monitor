import React from "react";

export default function StepIndicator({ currentStep = 1, totalSteps = 3 }) {
  return (
    <div className="inline-flex items-center justify-center mx-auto mt-6 select-none">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step Circle */}
            <div
              className={`
                flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                ${isCompleted ? "bg-blue-600 text-white" : ""}
                ${isCurrent ? "border-2 border-blue-600 text-blue-600" : ""}
                ${!isCompleted && !isCurrent ? "border-2 border-gray-400 text-gray-400" : ""}
              `}
            >
              {isCompleted ? "✓" : stepNumber}
            </div>

            {/* Dotted Line (only if not last step) */}
            {stepNumber !== totalSteps && (
              <div className="w-10 border-t-2 border-dotted border-gray-300 mx-2"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
