import React, { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useOnboarding } from "../../hooks/useOnboarding";
import SetupStepper from "../../components/admin/SetupStepper";

const stepRoutes = [
  "institution",
  "rooms",
  "subjects",
  "faculty",
  "enrollment",
];

const OnboardingWizard = () => {
  const { currentStep, fetchProgress, error, progress } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 LOAD BACKEND STATE (ONLY ONCE)
  useEffect(() => {
    fetchProgress();
  }, []);

  // 🔥 SYNC STEP WITH URL (IMPORTANT FIX)
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const stepIndex = stepRoutes.indexOf(path) + 1;

    // If user enters invalid route → redirect to correct step
    if (stepIndex === 0 && currentStep) {
      navigate(`/admin/setup/${stepRoutes[currentStep - 1]}`);
    }
  }, [location.pathname, currentStep]);

  return (
    <div className="max-w-6xl mx-auto pb-20">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          College <span className="text-green-600">Setup</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Complete all steps to prepare your timetable system.
        </p>
      </div>

      {/* Stepper */}
      <SetupStepper currentStep={currentStep} />

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="mt-8">
        <Outlet
          context={{
            progress, // 🔥 ALL DATA AVAILABLE TO CHILD COMPONENTS
          }}
        />
      </div>
    </div>
  );
};

export default OnboardingWizard;