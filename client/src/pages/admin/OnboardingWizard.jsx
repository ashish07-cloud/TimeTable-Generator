import React, { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useOnboarding } from "../../hooks/useOnboarding";
import SetupStepper from "../../components/admin/SetupStepper";
import LoadingScreen from "../../components/common/LoadingScreen";

const OnboardingWizard = () => {
  const { 
    currentStepNumber, 
    progress, 
    fetchProgress, 
    saveAndNext, 
    handleNavigate, 
    isLoading, 
    error 
  } = useOnboarding();

  // 🔥 DYNAMIC HEADER MAPPING
  const stepMetadata = useMemo(() => {
    const meta = {
      1: {
        title: "Institutional",
        highlight: "Configuration",
        description: "Define your college timings, working days, and courses."
      },
      2: {
        title: "Infrastructure",
        highlight: "Setup",
        description: "Add classrooms, labs, and seminar halls to the system."
      },
      3: {
        title: "Subject",
        highlight: "Catalog",
        description: "Build your academic curriculum including Core and NEP electives."
      },
      4: {
        title: "Faculty",
        highlight: "Registry",
        description: "Onboard your teaching staff and map their subject expertise."
      },
      5: {
        title: "Enrollment",
        highlight: "Mapping",
        description: "Define student batches and track elective subject demand."
      }
    };
    return meta[currentStepNumber] || meta[1];
  }, [currentStepNumber]);

  // Load progress once on mount
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Show loading screen only on the initial load when progress is null
  if (!progress && isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      
      {/* 🔥 DYNAMIC HEADER SECTION */}
      <div className="mb-8 mt-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {stepMetadata.title} <span className="text-orange-600">{stepMetadata.highlight}</span>
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase rounded-md border border-orange-200 dark:border-orange-800">
            Step {currentStepNumber} of 5
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {stepMetadata.description}
          </p>
        </div>
      </div>

      {/* Stepper (Dynamically highlighted based on currentStepNumber) */}
      <div className="mb-10">
        <SetupStepper currentStep={currentStepNumber} />
      </div>

      {/* Error Alert (Global for the wizard) */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Step Content Area (Child routes rendered here) */}
      <div className="mt-4 transition-all duration-500">
        <Outlet
          context={{
            progress,        // Institutional data for pre-filling forms
            saveAndNext,     // Logic to save data and move forward
            handleNavigate,  // Logic to move backward
            isLoading,       // Processing state for buttons
            fetchProgress    // Refresh trigger if data needs re-sync
          }}
        />
      </div>

      {/* Helpful Hint Footer (Optional) */}
      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-gray-400 dark:text-gray-500">
         <InfoIcon size={14} />
         <p className="text-[10px] font-medium uppercase tracking-widest">
           Your progress is automatically synced with the secure cloud database.
         </p>
      </div>
    </div>
  );
};

// Simple Info Icon for the footer
const InfoIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default OnboardingWizard;