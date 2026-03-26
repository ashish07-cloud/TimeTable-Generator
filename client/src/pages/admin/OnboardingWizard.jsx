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
  const { currentStep, fetchProgress, error } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Load progress from backend
  useEffect(() => {
    fetchProgress();
  }, []);

  // 🔥 Sync URL with backend step
  useEffect(() => {
    if (!currentStep) return;

    const correctPath = `/admin/setup/${stepRoutes[currentStep - 1]}`;

    // If user directly hits wrong URL → redirect
    if (location.pathname !== correctPath) {
      navigate(correctPath, { replace: true });
    }
  }, [currentStep]);

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
        <Outlet />
      </div>
    </div>
  );
};

export default OnboardingWizard;