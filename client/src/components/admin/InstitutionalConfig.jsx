import React, { useState, useEffect } from "react";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import dataService from "../../api/dataService";
import { useOnboarding } from "../../hooks/useOnboarding";

const InstitutionalConfig = () => {
  const { goToNextStep, isLoading } = useOnboarding();

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

  // 🔥 PREFILL + LOCK
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await dataService.getProgress();

        if (res?.data?.institution) {
          const inst = res.data.institution;

          setFormData((prev) => ({
            ...prev,
            collegeName: inst.collegeName || "",
            workingDays: inst.workingDays || [],
            startTime: inst.startTime || "09:00",
            endTime: inst.endTime || "17:00",
            periodDuration: inst.periodDuration || 60,
            windows: inst.slotWindows || prev.windows,
            courses: res.data.courses?.map((c) => c.name) || [], // 🔥 ADD THIS
          }));

          if (res.data.step >= 2) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Failed to load institution data");
      }
    };

    loadData();
  }, []);

  // 🔹 Toggle Day
  const toggleDay = (day) => {
    if (isLocked) return;

    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  // 🔹 Toggle Course
  const toggleCourse = (course) => {
    if (isLocked) return;

    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter((c) => c !== course)
        : [...prev.courses, course],
    }));
  };

  // 🔹 SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked) {
      console.warn("Step already completed");
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

    goToNextStep(payload, dataService.saveInstitutionConfig);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🔒 LOCK MESSAGE */}
      {isLocked && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
          Institution already configured. Proceed to next step.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">
          {/* College Name */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              College Name
            </label>
            <input
              type="text"
              value={formData.collegeName}
              disabled={isLocked}
              onChange={(e) =>
                setFormData({ ...formData, collegeName: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-xl"
              required
            />
          </div>

          {/* Courses Offered */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Courses Offered</h3>

            <div className="flex flex-wrap gap-2">
              {courseOptions.map((course) => (
                <button
                  key={course}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleCourse(course)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    formData.courses.includes(course)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>

          {/* Working Days */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-green-600" size={20} />
              Working Days
            </h3>

            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    formData.workingDays.includes(day)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-500">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                disabled={isLocked}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                disabled={isLocked}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Duration</label>
              <select
                value={formData.periodDuration}
                disabled={isLocked}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    periodDuration: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value={45}>45</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT - WINDOWS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">NEP Windows</h3>

            {["GE", "SEC", "AEC", "VAC"].map((type) => (
              <div key={type} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>{type}</span>
                  <input
                    type="checkbox"
                    checked={formData.windows[type].active}
                    disabled={isLocked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        windows: {
                          ...formData.windows,
                          [type]: {
                            ...formData.windows[type],
                            active: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="time"
                    value={formData.windows[type].start}
                    disabled={isLocked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        windows: {
                          ...formData.windows,
                          [type]: {
                            ...formData.windows[type],
                            start: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                  <input
                    type="time"
                    value={formData.windows[type].end}
                    disabled={isLocked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        windows: {
                          ...formData.windows,
                          [type]: {
                            ...formData.windows[type],
                            end: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full py-3 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2"
          >
            {isLocked ? "Completed" : isLoading ? "Saving..." : "Save & Next"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default InstitutionalConfig;
