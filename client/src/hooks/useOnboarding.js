import { useState, useCallback } from "react";
import dataService from "../api/dataService";

export const STEPS = {
  INSTITUTION: 1,
  ROOMS: 2,
  SUBJECTS: 3,
  FACULTY: 4,
  ENROLLMENT: 5,
};

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.INSTITUTION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 ALWAYS TRUST BACKEND
const fetchProgress = useCallback(async () => {
  try {
    const res = await dataService.getProgress();

    if (res?.data?.step) {
      setCurrentStep(res.data.step); // 🔥 THIS IS KEY
    }

    return res.data; // 🔥 return data for UI use
  } catch (err) {
    console.error("Progress fetch failed");
  }
}, []);

  // 🔥 SAVE + REFETCH (NO LOCAL STEP CHANGE)
  const goToNextStep = useCallback(async (data, saveFn) => {
    setIsLoading(true);
    setError(null);

    try {
      if (saveFn && data) {
        await saveFn(data); // save to backend
      }

      // 🔥 REFRESH FROM BACKEND (source of truth)
      await fetchProgress();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  }, [fetchProgress]);

  const goToPrevStep = useCallback(() => {
    // 🔥 optional (not needed in locked flow)
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentStep,
    isLoading,
    error,
    goToNextStep,
    goToPrevStep,
    fetchProgress,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 5,
  };
};