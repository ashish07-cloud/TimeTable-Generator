import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Users,
  Layers,
  BookCheck,
  ArrowRight,
  ChevronLeft,
  Trash2,
  Plus,
  Info,
  BarChart3,
  Hash,
  GraduationCap,
} from "lucide-react";
import dataService from "../../api/dataService";

const EnrollmentManager = ({ onNext, onPrev, isLoading }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("CORE");
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const navigate = useNavigate();

  // const { subjects = [] } = useOutletContext();

  // console.log("SUBJECTS:", subjects);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await dataService.getSubjectsForFaculty();
        setSubjects(res.data);
      } catch (err) {
        console.error("Failed to load subjects");
      }
    };

    loadSubjects();
  }, []);

  useEffect(() => {
  const loadEnrollment = async () => {
    try {
      const res = await dataService.getEnrollment();

      const data = res.data || [];

      // 🔥 TRANSFORM BACKEND → FRONTEND FORMAT
      const formatted = data.map((g) => ({
        name: g.name,
        semester: g.semester,
        batchSize: g.batchSize,
        courseId: g.courseId,
        coreIds: g.Subjects
          ?.filter((s) => s.GroupCoreSubject.type === "CORE")
          .map((s) => s.id) || [],
        electiveCounts: g.electiveChoices || {},
      }));

      setGroups(formatted);
    } catch (err) {
      console.error("Failed to load enrollment");
    }
  };

  loadEnrollment();
}, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await dataService.getProgress();
        setCourses(res.data.courses || []);

        if (res.data.courses?.length) {
          setSelectedCourseId(res.data.courses[0].id); // default
        }
      } catch (err) {
        console.error("Failed to load courses");
      }
    };

    loadCourses();
  }, []);

  const [newGroup, setNewGroup] = useState({
    name: "",
    semester: 1,
    batchSize: 60,
    coreIds: [],
    electiveCounts: {},
  });

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const handleAddGroup = () => {
    if (!newGroup.name || !selectedCourseId) {
      alert("Select course and enter batch name");
      return;
    }

    setGroups([
      ...groups,
      {
        ...newGroup,
        id: Date.now(),
        courseId: selectedCourseId, // ✅ IMPORTANT
      },
    ]);

    setNewGroup({
      name: "",
      semester: 1,
      batchSize: 60,
      coreIds: [],
      electiveCounts: {},
    });
  };

  // console.log(groups);

  const toggleCoreSubject = (subId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== selectedGroupId) return g;
        const coreIds = g.coreIds || [];
        return {
          ...g,
          coreIds: coreIds.includes(subId)
            ? coreIds.filter((id) => id !== subId)
            : [...coreIds, subId],
        };
      }),
    );
  };

  const updateElectiveCount = (subId, count) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== selectedGroupId) return g;
        return {
          ...g,
          electiveCounts: {
            ...g.electiveCounts,
            [subId]: parseInt(count) || 0,
          },
        };
      }),
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Bar: Resource Awareness */}
      <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 text-white rounded-lg">
            <BarChart3 size={18} />
          </div>
          <p className="text-sm font-medium dark:text-green-400">
            Total Enrolled:{" "}
            <span className="font-bold">
              {groups.reduce((acc, g) => acc + g.batchSize, 0)}
            </span>{" "}
            Students
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 italic">
          <Info size={14} />
          Ensure total elective counts do not exceed batch size.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: GROUP LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-[600px] flex flex-col">
            <h3 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Layers size={18} className="text-green-600" /> Student Batches
            </h3>

            <div className="space-y-3 mb-6">
              <input
                placeholder="Batch Name (e.g. B.Sc CS Sem 2)"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Sem"
                  value={newGroup.semester}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      semester: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Size"
                  value={newGroup.batchSize}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      batchSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none dark:text-white"
                />
              </div>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none dark:text-white"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddGroup}
                className="w-full py-2 bg-gray-900 dark:bg-green-700 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
              >
                Create Batch
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedGroupId === g.id
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-1 ring-green-500"
                      : "bg-white dark:bg-gray-900 border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm dark:text-white">
                      {g.name}
                    </p>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                      Sem {g.semester}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Users size={12} /> {g.batchSize}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <BookCheck size={12} /> {g.coreIds.length} Cores
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ASSIGNMENT EDITOR */}
        <div className="lg:col-span-8">
          {selectedGroup ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[600px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg dark:text-white">
                    {selectedGroup.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Assign mandatory core and elective counts.
                  </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  {["CORE", "ELECTIVES"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveSubTab(t)}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                        activeSubTab === t
                          ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {activeSubTab === "CORE" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects
                      .filter((s) => s.category === "CORE")
                      .map((sub) => {
                        const isSelected = selectedGroup.coreIds.includes(
                          sub.id,
                        );
                        return (
                          <button
                            key={sub.id}
                            onClick={() => toggleCoreSubject(sub.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-green-50 dark:bg-green-900/10 border-green-500/50"
                                : "border-gray-100 dark:border-gray-800"
                            }`}
                          >
                            <div className="text-left">
                              <p className="text-xs font-bold dark:text-white">
                                {sub.code}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {sub.name}
                              </p>
                            </div>
                            {isSelected && (
                              <BookCheck size={16} className="text-green-600" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjects
                      .filter((s) => s.category !== "CORE")
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded uppercase">
                              {sub.category}
                            </span>
                            <div>
                              <p className="text-xs font-bold dark:text-white">
                                {sub.code}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {sub.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] font-bold text-gray-400">
                              ENROLLED:
                            </label>
                            <input
                              type="number"
                              value={selectedGroup.electiveCounts[sub.id] || ""}
                              onChange={(e) =>
                                updateElectiveCount(sub.id, e.target.value)
                              }
                              placeholder="0"
                              className="w-16 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-center dark:text-white outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400">
              <GraduationCap size={48} strokeWidth={1} className="mb-4" />
              <p className="font-medium text-sm">
                Create and select a batch to manage enrollment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex justify-between items-center mt-10">
       <button
  onClick={() => navigate("/admin/setup/faculty")}
  className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 transition-all"
>
  Back
</button>

        <button
          onClick={async () => {
            try {
              if (!groups?.length) {
                alert("Please create at least one batch");
                return;
              }

              for (let g of groups) {
                if (!g.name || !g.semester || !g.batchSize) {
                  alert("Please fill all batch details properly");
                  return;
                }

                if (!g.coreIds?.length) {
                  alert(`Select at least one core subject for ${g.name}`);
                  return;
                }
              }

              // ✅ SAVE ONLY (NO SOLVER)
              await dataService.saveEnrollment(groups);

              // ✅ Move to next page (Generate Timetable)
              navigate("/admin/generate");
            } catch (err) {
              console.error("FULL ERROR:", err.response?.data);

              const errors = err.response?.data?.errors;

              if (errors && errors.length) {
                errors.forEach((e) => {
                  console.error(`FIELD: ${e.path} → ${e.message}`);
                });
              }

              alert(err.response?.data?.message || "Failed to save enrollment");
            }
          }}
          className="group relative px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
        >
          <span className="relative z-10 flex items-center gap-2 uppercase tracking-tighter">
            Save & Continue
            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>

          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default EnrollmentManager;
