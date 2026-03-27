import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Loader2, 
  CalendarDays, 
  ChevronRight, 
  AlertCircle,
  BookOpen,
  Layers
} from "lucide-react";
import { generateTimetable } from "../../api/timetableService";
import dataService from "../../api/dataService";
import TimetableGrid from "../../components/timetable/TimetableGrid";

const GenerateTimetable = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // --- INITIAL LOAD: FETCH COURSES ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await dataService.getProgress(); // Fetching from the onboarding setup data
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // --- TRANSFORM BACKEND DATA FOR UI ---
  const transformData = (response) => {
    // The Python CP-SAT Solver returns a flat array of assignments
    const schedule = response?.data?.scheduleData?.schedule || [];

    return schedule.map((item) => ({
      day: item.day,
      slot: item.slot_index + 1,
      subjectId: item.subject_id,
      subjectName: item.subject_name, // If returned by solver
      room: item.room_id,
      faculty: item.faculty_name,   // If returned by solver
    }));
  };

  // --- TRIGGER AI SOLVER ---
  const handleGenerate = async () => {
    if (!selectedCourse || !selectedSemester) {
      alert("Please select both a Course and a Semester.");
      return;
    }

    setLoading(true);
    setTimetable([]); // Clear old results

    try {
      const result = await generateTimetable({
        courseId: selectedCourse,
        semester: selectedSemester,
      });

      console.log("AI Solver Success:", result);
      const formatted = transformData(result);
      setTimetable(formatted);

    } catch (err) {
      console.error("Solver Error:", err);
      alert(err.response?.data?.message || "Generation failed! Ensure constraints are valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white flex items-center gap-3 tracking-tighter">
            <Sparkles className="text-green-500" size={32} />
            AI GENERATION HUB
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Trigger the Google OR-Tools engine to solve your institutional constraints.
          </p>
        </div>
        
        {timetable.length > 0 && (
           <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                Optimization: Stable
              </span>
           </div>
        )}
      </div>

      {/* 🧩 SELECTION & CONTROL PANEL */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          {/* COURSE DROPDOWN */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14}/> Targeted Degree Program
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none cursor-pointer"
            >
              <option value="">Select Course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* SEMESTER DROPDOWN */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14}/> Academic Period
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none cursor-pointer"
            >
              <option value="">Select Semester...</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* GENERATE ACTION */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
              loading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg shadow-green-500/30 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Engine Solving...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Timetable
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🧩 OUTPUT AREA */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-8 bg-green-50 dark:bg-green-900/10 rounded-full">
                <Loader2 className="animate-spin text-green-500" size={48} />
             </div>
             <div>
                <h4 className="font-bold dark:text-white text-lg">Running CP-SAT Model</h4>
                <p className="text-gray-500 text-xs">Balancing room capacities and faculty availability...</p>
             </div>
          </div>
        ) : timetable.length > 0 ? (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center gap-2 mb-4 text-xs font-bold text-green-600 uppercase">
                <CalendarDays size={16}/> Optimization Result
             </div>
             <TimetableGrid timetableData={timetable} />
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-300 dark:text-gray-700">
             <AlertCircle size={48} strokeWidth={1} className="mb-4 opacity-20"/>
             <p className="text-sm font-medium">Select course and semester to generate view.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default GenerateTimetable;