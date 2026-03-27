import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useOutletContext } from "react-router-dom"; // 🔥 Use context for smooth flow
import dataService from "../../api/dataService";
import * as XLSX from "xlsx";

const CATEGORIES = ["CORE", "GE", "SEC", "AEC", "VAC"];
const ROOM_TYPES = [
  "LECTURE_HALL",
  "COMPUTER_LAB",
  "PHYSICS_LAB",
  "CHEMISTRY_LAB",
  "BIOLOGY_LAB",
];

const SubjectManager = () => {
  // 🔥 Get shared state and actions from OnboardingWizard
  const { progress, saveAndNext, handleNavigate, isLoading } = useOutletContext();
  const fileInputRef = useRef(null);

  // --- STATE ---
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState("CORE");
  const [showBulk, setShowBulk] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // 🔥 Track if step is already completed

  // NEW STATE FOR ELECTIVES
  const [electivePool, setElectivePool] = useState([]);
  const [selectedElectives, setSelectedElectives] = useState([]);

  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    department: "",
    lecture: 3,
    tutorial: 0,
    practical: 0,
    preferredRoom: "LECTURE_HALL",
  });

  // --- 1. SYNC WITH DATABASE PROGRESS ---
  useEffect(() => {
    if (progress) {
      // Load courses from config
      setCourses(progress.courses || []);

      // 🔥 PERSISTENCE: If subjects already exist in DB, load them into state
      if (progress.subjects && progress.subjects.length > 0) {
        setSubjects(progress.subjects);
      }

      // 🔥 LOCKING: If we've moved past this step (step >= 4), lock the UI
      if (progress.step >= 4) {
        setIsLocked(true);
      }
    }
  }, [progress]);

  // --- 2. FETCH ELECTIVES (For GE, SEC, AEC, VAC) ---
  const fetchElectives = async (category) => {
    try {
      const res = await dataService.getElectives();
      const filtered = res.data
        .filter((s) => s.defaultCategory === category)
        .map((s) => ({
          ...s,
          masterSubjectId: s.id,
        }));
      setElectivePool(filtered);
    } catch (err) {
      console.error("Failed to load electives pool", err);
    }
  };

  // --- 3. CORE SUBJECTS FETCH ---
  const fetchCoreSubjects = async () => {
    if (!selectedCourse) {
      alert("Please select a course first");
      return;
    }

    try {
      const res = await dataService.getCoreSubjects(selectedCourse, semester);

      const mapped = res.data.map((s) => ({
        id: `master-${s.id}`,
        masterSubjectId: s.id, 
        code: s.code,
        name: s.name,
        department: s.department,
        category: "CORE",
        lecture: s.lectureHours,
        tutorial: s.tutorialHours,
        practical: s.practicalHours,
        preferredRoom: s.preferredRoomType,
        courseId: selectedCourse,
      }));

      setSubjects((prev) => {
        const existingCodes = new Set(prev.map((p) => p.code.toLowerCase()));
        const uniqueNew = mapped.filter(
          (m) => !existingCodes.has(m.code.toLowerCase()),
        );
        return [...prev, ...uniqueNew];
      });
    } catch (err) {
      console.error("Failed to fetch core subjects", err);
    }
  };

  // --- 4. EXCEL UPLOAD ---
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      const mapped = json.map((row) => ({
        id: Date.now() + Math.random(),
        masterSubjectId: row.masterSubjectId || null, 
        code: String(row.code || "").toUpperCase(),
        name: row.name,
        department: row.department || "General",
        category: (row.category || "GE").toUpperCase(),
        lecture: Number(row.lectureHours || 0),
        tutorial: Number(row.tutorialHours || 0),
        practical: Number(row.practicalHours || 0),
        preferredRoom: row.preferredRoomType || "LECTURE_HALL",
      }));

      const unique = mapped.filter((newSub) => {
        return !subjects.some(
          (s) =>
            s.code.toLowerCase() === newSub.code.toLowerCase() &&
            s.category === newSub.category,
        );
      });

      setSubjects((prev) => [...prev, ...unique]);
      e.target.value = null;
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const data = [
      {
        code: "ECO101",
        name: "Micro Economics",
        department: "Economics",
        category: "GE",
        lectureHours: 3,
        tutorialHours: 1,
        practicalHours: 0,
        preferredRoomType: "LECTURE_HALL",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subjects_template.xlsx");
  };

  // --- 5. MANUAL ADD ---
  const handleAddSubject = () => {
    if (!newSubject.code || !newSubject.name) return;

    const exists = subjects.some(
      (s) =>
        s.code.toLowerCase() === newSubject.code.toLowerCase() &&
        s.category === activeTab
    );

    if (exists) {
      alert("Duplicate subject not allowed");
      return;
    }

    setSubjects([
      ...subjects,
      {
        ...newSubject,
        masterSubjectId: null, 
        category: activeTab,
        id: Date.now(),
      },
    ]);

    setNewSubject({ ...newSubject, code: "", name: "" });
  };

  const removeSubject = (id) => {
    if (isLocked) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // --- 6. SMART SUBMIT (SAVES TO DB OR MOVES NEXT) ---
  const handleSubmit = async () => {
    // 🔥 FLOW: If already saved and verified by backend, just move next
    if (isLocked) {
      await saveAndNext();
      return;
    }

    if (!selectedCourse || !semester) {
      alert("Select course and semester");
      return;
    }

    if (!subjects || subjects.length === 0) {
      alert("No subjects added");
      return;
    }

    // Validation for Master System Rule
    const invalid = subjects.filter((s) => !s.masterSubjectId);
    if (invalid.length > 0) {
      alert("All subjects must come from Master Subjects. Use the available pools.");
      return;
    }

    // Prepare DB Payload
    const payload = subjects.map((s) => ({
      masterSubjectId: s.masterSubjectId, 
      code: s.code,
      name: s.name,
      department: s.department,
      category: s.category,
      lectureHours: s.lecture,
      tutorialHours: s.tutorial,
      practicalHours: s.practical,
      preferredRoomType: s.preferredRoom,
      courseId: selectedCourse,
      semester: semester,
    }));

    try {
      // 🔥 SAVE TO DB AND NAVIGATE
      await saveAndNext(payload, dataService.saveSubjects);
    } catch (err) {
        // If data is already there (Duplicate Error), navigate forward anyway
        if (err.response?.data?.message?.includes("Validation") || err.response?.status === 400) {
            await saveAndNext();
        } else {
            alert("Submission failed. Check Console.");
        }
    }
  };

  const filteredSubjects = subjects.filter((s) => s.category === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 🔒 STATUS MESSAGE */}
      {isLocked && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">Subjects already configured for this semester. You can proceed.</span>
        </div>
      )}

      {/* SELECTION HEADER */}
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap items-end gap-4">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Target Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={isLocked}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
          >
            <option value="">Choose a program...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1 w-32">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            disabled={isLocked}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchCoreSubjects}
          disabled={isLocked || !selectedCourse}
          className="px-6 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all disabled:opacity-50"
        >
          <Sparkles size={16} /> Load Core Subjects
        </button>
      </div>

      {/* TABS */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-full max-w-2xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              setSelectedElectives([]); 
              if (cat !== "CORE") fetchElectives(cat);
            }}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === cat
                ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ELECTIVE POOL UI */}
      {activeTab !== "CORE" && electivePool.length > 0 && !isLocked && (
        <div className="bg-white dark:bg-gray-800/50 border border-orange-100 dark:border-orange-900/30 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-orange-500" /> Select available {activeTab} Subjects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {electivePool.map((sub) => (
              <label
                key={sub.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  subjects.some(s => s.masterSubjectId === sub.id)
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800"
                    : "bg-gray-50 dark:bg-gray-800 border-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  checked={subjects.some(s => s.masterSubjectId === sub.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                        setSubjects([...subjects, {
                            id: sub.id,
                            masterSubjectId: sub.id,
                            code: sub.code,
                            name: sub.name,
                            department: sub.department,
                            category: sub.defaultCategory,
                            lecture: sub.lectureHours,
                            tutorial: sub.tutorialHours,
                            practical: sub.practicalHours,
                            preferredRoom: sub.preferredRoomType
                        }]);
                    } else {
                        setSubjects(subjects.filter(s => s.masterSubjectId !== sub.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="text-xs font-bold dark:text-white">{sub.code}</p>
                  <p className="text-[10px] text-gray-500 truncate">{sub.name}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR TOOLS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold dark:text-white flex items-center gap-2">
                {showBulk ? <Upload size={18} className="text-orange-600" /> : <Plus size={18} className="text-orange-600" />}
                {showBulk ? "Bulk Import" : activeTab === "CORE" ? "Manual Add" : "Import Subjects"}
              </h3>
              {!isLocked && (
                <button
                  onClick={() => setShowBulk(!showBulk)}
                  className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg"
                >
                  {showBulk ? "Manual Entry" : "Excel Import"}
                </button>
              )}
            </div>

            {showBulk && !isLocked ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-orange-500 cursor-pointer group"
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                  <FileSpreadsheet className="mx-auto text-gray-300 group-hover:text-orange-500 mb-2" size={40} />
                  <p className="text-sm font-medium dark:text-gray-300">Click to upload Excel</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download Template
                </button>
              </div>
            ) : activeTab === "CORE" && !isLocked ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Code & Name</label>
                  <div className="flex gap-2">
                    <input
                      placeholder="CS101"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                      className="w-1/3 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      placeholder="Subject Name"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      className="w-2/3 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["lecture", "tutorial", "practical"].map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase text-center block">{key[0]}</label>
                      <input
                        type="number"
                        value={newSubject[key]}
                        onChange={(e) => setNewSubject({ ...newSubject, [key]: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-center dark:text-white"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Room Type</label>
                  <select
                    value={newSubject.preferredRoom}
                    onChange={(e) => setNewSubject({ ...newSubject, preferredRoom: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none dark:text-white"
                  >
                    {ROOM_TYPES.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddSubject}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Subject
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Catalog is managed via pools for {activeTab} subjects.</p>
              </div>
            )}
          </div>
        </div>

        {/* LIST TABLE */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold dark:text-white">{activeTab} List ({filteredSubjects.length})</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white dark:bg-gray-800/50 text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">L-T-P</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                        No subjects added to this category yet.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm dark:text-white">{s.code}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{s.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">L:{s.lecture}</span>
                            <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded text-[10px] font-bold">T:{s.tutorial}</span>
                            <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-[10px] font-bold">P:{s.practical}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-medium dark:text-gray-400 uppercase">
                          {s.preferredRoom?.replace("_", " ") || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isLocked && (
                            <button onClick={() => removeSubject(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => handleNavigate("prev")}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <ChevronLeft size={20} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (subjects.length === 0 && !isLocked)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-800 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isLoading ? "Saving Catalog..." : (isLocked || subjects.length > 0) ? "Next: Faculty" : "Save & Continue"} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManager;