import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dataService from "../api/dataService";

export const stepRoutes = [
  "institution",
  "rooms",
  "subjects",
  "faculty",
  "enrollment",
];

export const useOnboarding = () => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 1. Derive current step number from the URL path
  const path = location.pathname.split("/").pop();
  const currentStepNumber = stepRoutes.indexOf(path) + 1 || 1;

  // 2. Fetch all academic progress from DB
  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dataService.getProgress();
      setProgress(res.data);
      return res.data;
    } catch (err) {
      console.error("Progress Sync Error:", err);
      setError("Failed to sync institutional progress.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Navigation Logic (Forward/Backward)
  const handleNavigate = useCallback(
    (direction) => {
      const currentIndex = stepRoutes.indexOf(path);
      const nextIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex >= 0 && nextIndex < stepRoutes.length) {
        navigate(`/admin/setup/${stepRoutes[nextIndex]}`);
      }
    },
    [path, navigate],
  );

  // 4. Save Logic + Move to next
  const saveAndNext = useCallback(
    async (data, saveFn) => {
      setIsLoading(true);
      setError(null);

      try {
        // Only call save if data and a save function are provided
        if (saveFn && data) {
          await saveFn(data);
        }

        // Always refresh global progress after a save
        await fetchProgress();

        // Move to next URL
        handleNavigate("next");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to save data. Please try again.",
        );
        throw err; // Let the component handle local error UI if needed
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProgress, handleNavigate],
  );

  return {
    currentStepNumber,
    progress,
    isLoading,
    error,
    fetchProgress,
    saveAndNext,
    handleNavigate,
  };
};
