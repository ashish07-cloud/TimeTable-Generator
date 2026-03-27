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
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import dataService from "../../api/dataService";

const EnrollmentManager = () => {
  // 🔥 Sync with the Onboarding Wizard Context
  const { progress, saveAndNext, handleNavigate, isLoading: parentLoading } = useOutletContext();
  const navigate = useNavigate();

  // --- STATE ---
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("CORE");
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: "",
    semester: 1,
    batchSize: 60,
    coreIds: [],
    electiveCounts: {},
  });

  // --- 1. SYNC WITH DATABASE PROGRESS ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch the full subject catalog (from Step 3)
        const subRes = await dataService.getSubjects();
        setSubjects(subRes.data || []);

        if (progress) {
          // Load courses from Institutional Config (Step 1)
          const courseList = progress.courses || [];
          setCourses(courseList);
          if (courseList.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courseList[0].id);
          }

          // 🔥 PERSISTENCE: If enrollment groups already exist, load and transform them
          if (progress.enrollment && progress.enrollment.length > 0) {
            const formatted = progress.enrollment.map((g) => ({
              id: g.id || Date.now() + Math.random(),
              name: g.name,
              semester: g.semester,
              batchSize: g.batchSize,
              courseId: g.courseId,
              coreIds: g.Subjects
                ?.filter((s) => s.GroupCoreSubject?.type === "CORE")
                .map((s) => s.id) || g.coreIds || [],
              electiveCounts: g.electiveChoices || g.electiveCounts || {},
            }));
            setGroups(formatted);
          }

          // If step is 6 or higher, onboarding is complete
          if (progress.step >= 6) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Enrollment Sync Error:", err);
      }
    };
    loadInitialData();
  }, [progress]);

  // --- 2. DYNAMIC LOGIC ---
  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const handleAddGroup = () => {
    if (isLocked) return;
    if (!newGroup.name || !selectedCourseId) {
      alert("Please select a course and enter a batch name.");
      return;
    }

    setGroups([
      ...groups,
      {
        ...newGroup,
        id: Date.now(),
        courseId: selectedCourseId,
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

  const removeGroup = (id) => {
    if (isLocked) return;
    setGroups(groups.filter((g) => g.id !== id));
    if (selectedGroupId === id) setSelectedGroupId(null);
  };

  const toggleCoreSubject = (subId) => {
    if (isLocked) return;
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
      })
    );
  };

  const updateElectiveCount = (subId, count) => {
    if (isLocked) return;
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
      })
    );
  };

  // --- 3. FINAL SAVE ---
  const handleFinalSubmit = async () => {
    // If onboarding is already finished, move to Generate
    if (isLocked) {
      navigate("/admin/generate");
      return;
    }

    if (groups.length === 0) {
      alert("Please create at least one batch (Student Group).");
      return;
    }

    // NEP 2020 Validation
    for (let g of groups) {
      if (!g.coreIds?.length) {
        alert(`Select mandatory CORE subjects for batch: ${g.name}`);
        return;
      }
    }

    try {
      // Save Enrollment to DB
      await saveAndNext(groups, dataService.saveEnrollment);
      // Last Step: Manual redirect to the Generate page
      navigate("/admin/generate");
    } catch (err) {
      console.error("Save Enrollment Error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to finalize enrollment.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 🔒 STATUS MESSAGE */}
      {isLocked && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 shadow-sm">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Enrollment mappings confirmed. System ready for generation.</span>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500 text-white rounded-lg">
            <BarChart3 size={18} />
          </div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Total Enrolled: <span className="text-orange-600 dark:text-orange-400 ml-1">{groups.reduce((acc, g) => acc + g.batchSize, 0)} Students</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 italic">
          <Info size={14} /> Total elective counts should ideally match batch size.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: GROUP CREATION & LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-[600px] flex flex-col">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Layers size={18} className="text-orange-600 dark:text-orange-400" /> Student Batches
            </h3>

            {!isLocked && (
              <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <input
                  placeholder="Batch Name (e.g. B.Sc CS Sem 1)"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Sem"
                    value={newGroup.semester}
                    onChange={(e) => setNewGroup({ ...newGroup, semester: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Batch Size"
                    value={newGroup.batchSize}
                    onChange={(e) => setNewGroup({ ...newGroup, batchSize: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
                  />
                </div>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddGroup}
                  className="w-full py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Create Batch
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {groups.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-xs italic">No batches created.</div>
              ) : (
                groups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`group w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedGroupId === g.id
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500/50 ring-1 ring-orange-500/20"
                        : "bg-white dark:bg-gray-800/30 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{g.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Sem {g.semester} • {g.batchSize} Students</p>
                      </div>
                      {!isLocked && (
                        <button onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }} className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: SUBJECTS & COUNTS */}
        <div className="lg:col-span-8">
          {selectedGroup ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[600px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedGroup.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assign subjects and elective demand.</p>
                </div>
                <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
                  {["CORE", "ELECTIVES"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveSubTab(t)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        activeSubTab === t ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm" : "text-gray-500 dark:text-gray-400"
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
                      .filter((s) => s.category === "CORE" && s.courseId === selectedGroup.courseId)
                      .map((sub) => {
                        const isSelected = selectedGroup.coreIds?.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            disabled={isLocked}
                            onClick={() => toggleCoreSubject(sub.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                              isSelected ? "bg-orange-50 dark:bg-orange-900/10 border-orange-500" : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold dark:text-white">{sub.code}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub.name}</p>
                            </div>
                            {isSelected && <BookCheck size={18} className="text-orange-600 dark:text-orange-400" />}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjects
                      .filter((s) => s.category !== "CORE")
                      .map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase">{sub.category}</span>
                            <div>
                              <p className="text-xs font-bold dark:text-white">{sub.code}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{sub.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">DEMAND:</span>
                            <input
                              type="number"
                              disabled={isLocked}
                              value={selectedGroup.electiveCounts?.[sub.id] || ""}
                              onChange={(e) => updateElectiveCount(sub.id, e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-center dark:text-white focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 dark:text-gray-500">
              <GraduationCap size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-medium text-sm">Select a batch to define enrollment demand.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex justify-between items-center mt-10">
        <button
          onClick={() => handleNavigate("prev")}
          className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <button
          onClick={handleFinalSubmit}
          disabled={parentLoading || (groups.length === 0 && !isLocked)}
          className="group relative px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg overflow-hidden transition-all hover:scale-[1.02] shadow-2xl"
        >
          <span className="relative z-10 flex items-center gap-2 uppercase tracking-tighter">
            {parentLoading ? "Finalizing..." : isLocked ? "Next: Generation" : "Complete & Finalize"}
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default EnrollmentManager;