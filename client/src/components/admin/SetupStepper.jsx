import React from "react";

const steps = [
  { id: 1, label: "Institution" },
  { id: 2, label: "Rooms" },
  { id: 3, label: "Subjects" },
  { id: 4, label: "Faculty" },
  { id: 5, label: "Enrollment" },
];

const SetupStepper = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex items-center gap-2">
              {/* Circle */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-all
                  ${
                    isActive
                      ? "bg-orange-600 text-white dark:bg-orange-500"
                      : isCompleted
                      ? "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                  }
                `}
              >
                {step.id}
              </div>

              {/* Label */}
              <span
                className={`text-sm font-medium whitespace-nowrap
                  ${
                    isActive
                      ? "text-orange-700 dark:text-orange-400"
                      : isCompleted
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {index !== steps.length - 1 && (
              <div
                className={`h-[2px] w-8 mx-1
                  ${
                    step.id < currentStep
                      ? "bg-orange-500 dark:bg-orange-400"
                      : "bg-gray-200 dark:bg-gray-700"
                  }
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SetupStepper;