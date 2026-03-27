import React, { useState, useEffect } from "react";
import { Calendar, ChevronRight, CheckCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import dataService from "../../api/dataService";

const InstitutionalConfig = () => {
  // 🔥 Consume shared state and logic from OnboardingWizard
  const { progress, saveAndNext, isLoading } = useOutletContext();

  const [formData, setFormData] = useState({
    collegeName: "",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "17:00",
    periodDuration: 60,
    courses: [],
    windows: {
      GE: { start: "09:00", end: "11:00", active: true },
      SEC: { start: "15:00", end: "17:00", active: true },
      AEC: { start: "11:00", end: "12:00", active: true },
      VAC: { start: "14:00", end: "15:00", active: false },
    },
  });

  const [isLocked, setIsLocked] = useState(false);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const courseOptions = [
    "B.Sc Computer Science",
    "B.Sc Physics",
    "B.Sc Chemistry",
    "B.A English",
    "B.A Political Science",
    "B.Com",
    "BBA",
    "BCA",
  ];

  // 🔥 PREFILL Logic: When progress is loaded from parent, sync internal form
  useEffect(() => {
    if (progress?.institution) {
      const inst = progress.institution;

      setFormData({
        collegeName: inst.collegeName || "",
        workingDays: inst.workingDays || [],
        startTime: inst.startTime || "09:00",
        endTime: inst.endTime || "17:00",
        periodDuration: inst.periodDuration || 60,
        windows: inst.slotWindows || formData.windows,
        courses: progress.courses?.map((c) => c.name) || [],
      });

      // If the backend says the institution is already set (step >= 2), lock the fields
      if (progress.step >= 2) {
        setIsLocked(true);
      }
    }
  }, [progress]);

  const toggleDay = (day) => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const toggleCourse = (course) => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter((c) => c !== course)
        : [...prev.courses, course],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      // If data is already saved, simply move to the next URL
      await saveAndNext();
      return;
    }

    const payload = {
      collegeName: formData.collegeName,
      workingDays: formData.workingDays,
      startTime: formData.startTime,
      endTime: formData.endTime,
      periodDuration: formData.periodDuration,
      slotWindows: formData.windows,
      courses: formData.courses,
    };

    // Save and move to "rooms" route automatically
    await saveAndNext(payload, dataService.saveInstitutionConfig);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      {/* 🔒 STATUS MESSAGE */}
      {isLocked && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">
            Institutional structure confirmed. You can now proceed to Rooms.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* College Name Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              College Name
            </label>
            <input
              type="text"
              value={formData.collegeName}
              disabled={isLocked}
              onChange={(e) =>
                setFormData({ ...formData, collegeName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Courses Offered Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Courses Offered</h3>
            <div className="flex flex-wrap gap-3">
              {courseOptions.map((course) => (
                <button
                  key={course}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleCourse(course)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.courses.includes(course)
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>

          {/* Working Days Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar size={20} className="text-orange-500" />
              Working Days
            </h3>
            <div className="flex flex-wrap gap-3">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.workingDays.includes(day)
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Timing Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  disabled={isLocked}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  disabled={isLocked}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                <select
                  value={formData.periodDuration}
                  disabled={isLocked}
                  onChange={(e) => setFormData({ ...formData, periodDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">NEP Windows</h3>
            <div className="space-y-5">
              {["GE", "SEC", "AEC", "VAC"].map((type) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.windows[type].active}
                        disabled={isLocked}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            windows: {
                              ...formData.windows,
                              [type]: { ...formData.windows[type], active: e.target.checked },
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={formData.windows[type].start}
                      disabled={isLocked || !formData.windows[type].active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windows: { ...formData.windows, [type]: { ...formData.windows[type], start: e.target.value } },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="time"
                      value={formData.windows[type].end}
                      disabled={isLocked || !formData.windows[type].active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windows: { ...formData.windows, [type]: { ...formData.windows[type], end: e.target.value } },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg ${
              isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800"
            }`}
          >
            {isLoading ? "Saving..." : isLocked ? "Next: Rooms" : "Save & Continue"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default InstitutionalConfig;