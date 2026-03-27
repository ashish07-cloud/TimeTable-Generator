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
  const [progress, setProgress] = useState(null); // 🔥 FULL DATA STATE
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 FETCH COMPLETE PROGRESS (SOURCE OF TRUTH)
  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await dataService.getProgress();
      const data = res?.data;
      console.log("RAW API:", res);
console.log("DATA:", res.data);

      if (!data) throw new Error("Invalid progress response");

      // 🔥 STORE FULL DATA
      setProgress(data);

      // 🔥 STEP SYNC
      if (data.step) {
        setCurrentStep(data.step);
      }

      return data;
    } catch (err) {
      console.error("❌ Progress fetch failed:", err);
      setError(err.response?.data?.message || "Failed to fetch progress");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔥 SAVE + REFRESH (NO LOCAL STATE TRUST)
  const goToNextStep = useCallback(
    async (data, saveFn) => {
      setIsLoading(true);
      setError(null);

      try {
        if (saveFn && data) {
          await saveFn(data); // 🔥 save to backend
        }

        // 🔥 ALWAYS REFETCH AFTER SAVE
        const updated = await fetchProgress();

        if (!updated) {
          throw new Error("Failed to refresh progress");
        }
      } catch (err) {
        console.error("❌ Step transition failed:", err);
        setError(err.response?.data?.message || "Failed to save step");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProgress]
  );

  // 🔥 OPTIONAL BACK NAVIGATION
  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, STEPS.INSTITUTION));
  }, []);

  return {
    // 🔹 STATE
    currentStep,
    progress,
    isLoading,
    error,

    // 🔹 ACTIONS
    fetchProgress,
    goToNextStep,
    goToPrevStep,

    // 🔹 HELPERS
    isFirstStep: currentStep === STEPS.INSTITUTION,
    isLastStep: currentStep === STEPS.ENROLLMENT,
  };
};