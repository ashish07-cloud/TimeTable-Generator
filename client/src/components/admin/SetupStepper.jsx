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
                      ? "bg-green-600 text-white"
                      : isCompleted
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-500"
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
                      ? "text-green-700"
                      : isCompleted
                      ? "text-gray-700"
                      : "text-gray-400"
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
                      ? "bg-green-500"
                      : "bg-gray-200"
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