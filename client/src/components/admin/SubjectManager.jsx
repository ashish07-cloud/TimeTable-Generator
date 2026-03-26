import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, ChevronLeft, ChevronRight, 
  BookOpen, Sparkles, LayoutGrid, Info, Search
} from "lucide-react";
import { useOnboarding } from "../../hooks/useOnboarding";
import dataService from "../../api/dataService";

const CATEGORIES = ["CORE", "GE", "SEC", "AEC", "VAC"];
const ROOM_TYPES = [
  "LECTURE_HALL", "COMPUTER_LAB", "PHYSICS_LAB", "CHEMISTRY_LAB", "BIOLOGY_LAB"
];

const SubjectManager = () => {
  const { goToNextStep, goToPrevStep, isLoading } = useOnboarding();

  // --- STATE ---
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState(1);
  const [subjects, setSubjects] = useState([]); // Master state for ALL categories
  const [activeTab, setActiveTab] = useState("CORE");

  const [newSubject, setNewSubject] = useState({
    code: "", name: "", department: "",
    lecture: 3, tutorial: 0, practical: 0,
    preferredRoom: "LECTURE_HALL",
  });

  // --- 1. LOAD COURSES ON MOUNT ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await dataService.getProgress();
        // Assuming getProgress returns the setup state including courses
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    loadInitialData();
  }, []);

  // --- 3. FETCH CORE SUBJECTS FROM MASTER LIBRARY ---
  const fetchCoreSubjects = async () => {
    if (!selectedCourse) {
      alert("Please select a course first");
      return;
    }

    try {
      const res = await dataService.getCoreSubjects(selectedCourse, semester);
      
      const mapped = res.data.map((s) => ({
        id: `master-${s.id}-${Date.now()}`, // Temporary UI ID
        code: s.code,
        name: s.name,
        department: s.department,
        category: "CORE",
        lecture: s.lectureHours,
        tutorial: s.tutorialHours,
        practical: s.practicalHours,
        preferredRoom: s.preferredRoomType,
        courseId: selectedCourse, // Explicitly link CORE subjects
      }));

      // Filter out duplicates (if user clicks "Load" twice)
      setSubjects(prev => {
        const existingCodes = new Set(prev.map(p => p.code));
        const uniqueNew = mapped.filter(m => !existingCodes.has(m.code));
        return [...prev, ...uniqueNew];
      });
    } catch (err) {
      console.error("Failed to fetch core subjects", err);
    }
  };

  // --- 6. ADD SUBJECT (MANUAL ENTRY) ---
  const handleAddSubject = () => {
    if (!newSubject.code || !newSubject.name) return;

    const subjectToAdd = {
      ...newSubject,
      category: activeTab,
      id: `manual-${Date.now()}`,
      // Link courseId only if we are adding a CORE subject manually
      courseId: activeTab === "CORE" ? selectedCourse : null, 
    };

    setSubjects([...subjects, subjectToAdd]);
    setNewSubject({ ...newSubject, code: "", name: "" }); // Reset code/name only
  };

  // --- 7. DELETE SUBJECT ---
  const removeSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // --- 8. FINAL SUBMIT ---
  const handleSubmit = () => {
    if (subjects.length === 0) return;

    const payload = subjects.map((s) => ({
      code: s.code,
      name: s.name,
      department: s.department || "General",
      category: s.category,
      lectureHours: s.lecture,
      tutorialHours: s.tutorial,
      practicalHours: s.practical,
      preferredRoomType: s.preferredRoom,
      courseId: s.category === "CORE" ? s.courseId : null, // Crucial for Solver logic
      semester: s.category === "CORE" ? semester : null,   // Electives are usually global
    }));

    goToNextStep(payload, dataService.saveSubjects);
  };

  const filteredSubjects = subjects.filter((s) => s.category === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1 & 2: COURSE & SEMESTER SELECTION */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-end gap-4">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Target Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
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
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchCoreSubjects}
          className="px-6 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-100 transition-all"
        >
          <Sparkles size={16}/> Load Core Subjects
        </button>
      </div>

      {/* 5: CATEGORY TABS */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-full max-w-2xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === cat
                ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 6: MANUAL INPUT SIDEBAR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold dark:text-white mb-6 flex items-center gap-2">
              <Plus size={18} className="text-green-600"/> Add {activeTab}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Code & Name</label>
                <div className="flex gap-2">
                  <input placeholder="CS101" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value.toUpperCase()})} className="w-1/3 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-green-500"/>
                  <input placeholder="Subject Name" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="w-2/3 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-green-500"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">L</label>
                  <input type="number" value={newSubject.lecture} onChange={e => setNewSubject({...newSubject, lecture: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-center dark:text-white"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">T</label>
                  <input type="number" value={newSubject.tutorial} onChange={e => setNewSubject({...newSubject, tutorial: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-center dark:text-white"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">P</label>
                  <input type="number" value={newSubject.practical} onChange={e => setNewSubject({...newSubject, practical: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-center dark:text-white"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Room Type</label>
                <select value={newSubject.preferredRoom} onChange={e => setNewSubject({...newSubject, preferredRoom: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none dark:text-white">
                  {ROOM_TYPES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>

              <button onClick={handleAddSubject} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                <Plus size={18}/> Add to Catalog
              </button>
            </div>
          </div>
        </div>

        {/* 4: SUBJECT LIST TABLE */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold dark:text-white">{activeTab} List ({filteredSubjects.length})</h3>
              <Info size={16} className="text-gray-400" />
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
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
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">
                        No subjects added to this category yet.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm dark:text-white">{s.code}</div>
                          <div className="text-xs text-gray-500">{s.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">L:{s.lecture}</span>
                            <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold">T:{s.tutorial}</span>
                            <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold">P:{s.practical}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-medium dark:text-gray-400">
                          {s.preferredRoom.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => removeSubject(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* NAVIGATION FOOTER */}
          <div className="flex justify-between items-center mt-8">
            <button onClick={goToPrevStep} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 transition-all flex items-center gap-2">
              <ChevronLeft size={20} /> Back
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={subjects.length === 0 || isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-lg shadow-green-500/30 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isLoading ? "Saving Catalog..." : "Save & Next"} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManager;