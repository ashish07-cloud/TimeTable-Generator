// GenerateTimetable.jsx
// Faithfully models the 3 reference timetables (CS, Maths, English Honours)
// with proper Lecture / Tutorial / Lab types, real slot times, groups, spanning labs.

import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  CalendarDays,
  AlertCircle,
  BookOpen,
  Layers,
  Download,
  RefreshCw,
} from "lucide-react";
import TimetableGrid from "../../components/timetable/TimetableGrid";

// ─── Static institutional dataset ────────────────────────────────────────────
// Each entry:
//   day        : "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"
//   slot       : 1-based index into TIME_SLOTS array in TimetableGrid
//                (1=8:30–9:30, 2=9:30–10:30, … 11=6:30–7:30)
//   subjectId  : short code
//   subjectName: display name
//   faculty    : professor / TA name
//   room       : room label
//   type       : "L" | "T" | "LAB"
//   group      : optional group label (G1/G2/G3)
//   spanSlots  : how many consecutive slots this entry spans (default 1; labs = 2)

const TIMETABLES = {
  // ── CS Hons  ────────────────────────────────────────────────────
  C1: [
    // Monday
    {
      day: "Mon",
      slot: 4,
      subjectId: "CS-PC-4002",
      subjectName: "CS-PC-4002",
      faculty: "SP",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 2,
      subjectId: "GE-F_PHY-10",
      subjectName: "GE-F_PHY-10",
      faculty: "PR",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 3,
      subjectId: "GE-F_PHY-10",
      subjectName: "GE-F_PHY-10",
      faculty: "PR",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 5,
      subjectId: "CS-PC-4002",
      subjectName: "CS-PC-4002",
      faculty: "SP",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 8,
      subjectId: "AEC-EVS-102",
      subjectName: "AEC-EVS-102",
      faculty: "SP",
      room: "",
      type: "L",
    },

    // Tuesday
    {
      day: "Tue",
      slot: 3,
      subjectId: "CS-PC-CS-LAB-2",
      subjectName: "CS-PC-CS LAB 2",
      faculty: "AG",
      room: "",
      type: "LAB",
      group: "G1",
      spanSlots: 2,
    },
    {
      day: "Tue",
      slot: 3,
      subjectId: "CS-PC-CS-LAB-2",
      subjectName: "CS-PC-CS LAB 2",
      faculty: "SP",
      room: "",
      type: "LAB",
      group: "G2",
      spanSlots: 2,
    },
    {
      day: "Tue",
      slot: 3,
      subjectId: "CS-PC-CS-LAB-2",
      subjectName: "CS-PC-CS LAB 2",
      faculty: "SR",
      room: "",
      type: "LAB",
      group: "G3",
      spanSlots: 2,
    },
    {
      day: "Tue",
      slot: 5,
      subjectId: "CS-C++4002",
      subjectName: "CS-C++4002",
      faculty: "RY",
      room: "",
      type: "L",
    },
    {
      day: "Tue",
      slot: 6,
      subjectId: "SEC-D_Market-101",
      subjectName: "CS-C++4002",
      faculty: "VN",
      room: "",
      type: "L",
    },
    {
      day: "Tue",
      slot: 7,
      subjectId: "SEC-D_Market-101",
      subjectName: "SEC-D_Market-101",
      faculty: "VN",
      room: "",
      type: "L",
    },
    {
      day: "Tue",
      slot: 8,
      subjectId: "SEC-D_Market-101",
      subjectName: "SEC-D_Market-101",
      faculty: "VN",
      room: "",
      type: "L",
    },

    // Wednesday
    {
      day: "Wed",
      slot: 3,
      subjectId: "CS-C++4005",
      subjectName: "CS-C++4005",
      faculty: "RY",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 4,
      subjectId: "CS-C++4005",
      subjectName: "CS-C++4005",
      faculty: "RY",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 5,
      subjectId: "CS-C++-LAB-2",
      subjectName: "CS-C++ CS LAB 2",
      faculty: "RY",
      room: "",
      type: "LAB",
      group: "G1",
      spanSlots: 2,
    },
    {
      day: "Wed",
      slot: 5,
      subjectId: "CS-C++-LAB-2",
      subjectName: "CS-C++ CS LAB 2",
      faculty: "SR",
      room: "",
      type: "LAB",
      group: "G2",
      spanSlots: 2,
    },
    {
      day: "Wed",
      slot: 5,
      subjectId: "CS-DMS-CS-LAB-1",
      subjectName: "CS-DMS CS LAB 1",
      faculty: "SP",
      room: "",
      type: "LAB",
      group: "G3",
      spanSlots: 2,
    },
    // Thursday
    {
      day: "Thu",
      slot: 5,
      subjectId: "CS-DMS-4002",
      subjectName: "CS-DMS-4002",
      faculty: "SP",
      room: "",
      type: "L",
    },
    {
      day: "Thu",
      slot: 6,
      subjectId: "CS-PC-4002",
      subjectName: "CS-PC-4002",
      faculty: "SP",
      room: "",
      type: "L",
    },
    // Friday
    {
      day: "Fri",
      slot: 3,
      subjectId: "CS-DMS-4002",
      subjectName: "CS-DMS-4002",
      faculty: "SP",
      room: "",
      type: "L",
    },
    {
      day: "Fri",
      slot: 4,
      subjectId: "CS-DMS-4002",
      subjectName: "CS-DMS-4002",
      faculty: "SP",
      room: "",
      type: "L",
    },
    {
      day: "Fri",
      slot: 5,
      subjectId: "CS-DMS-CS-LAB-1",
      subjectName: "CS-DMS CS LAB 1",
      faculty: "SP",
      room: "",
      type: "LAB",
      group: "G1",
      spanSlots: 2,
    },
    {
      day: "Fri",
      slot: 5,
      subjectId: "CS-DMS-CS-LAB-1",
      subjectName: "CS-DMS CS LAB 1",
      faculty: "RY",
      room: "",
      type: "LAB",
      group: "G2",
      spanSlots: 2,
    },
    {
      day: "Fri",
      slot: 7,
      subjectId: "CS-C++-CS-LAB-2",
      subjectName: "CS-C++ CS LAB 2",
      faculty: "RY",
      room: "",
      type: "LAB",
      group: "G3",
      spanSlots: 2,
    },
  ],

  // ── Maths Hons (Image 3) ─────────────────────────────────────────────────
  C2: [
    // Monday
    {
      day: "Mon",
      slot: 3,
      subjectId: "MATH-ODE-B6",
      subjectName: "MATH ODE B6",
      faculty: "SCH",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 4,
      subjectId: "EVS-I-34",
      subjectName: "EVS-I-34",
      faculty: "ANK",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 5,
      subjectId: "MATH-ODE-LAB-2",
      subjectName: "MATH ODE LAB 2",
      faculty: "SCH",
      room: "",
      type: "LAB",
      group: "G4",
      spanSlots: 2,
    },
    {
      day: "Mon",
      slot: 6,
      subjectId: "EVS-I-205",
      subjectName: "EVS-I-205",
      faculty: "PRL",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 7,
      subjectId: "EVS-LAB-I-11",
      subjectName: "EVS LAB I-11",
      faculty: "PRL",
      room: "",
      type: "LAB",
      spanSlots: 2,
    },
    // Tuesday
    {
      day: "Tue",
      slot: 4,
      subjectId: "MATH-LA-4007",
      subjectName: "MATH LA 4007",
      faculty: "PPG",
      room: "",
      type: "T",
      group: "G4",
    },
    {
      day: "Tue",
      slot: 5,
      subjectId: "MATH-LA-B4",
      subjectName: "MATH LA B4",
      faculty: "PPG",
      room: "",
      type: "L",
    },
    {
      day: "Tue",
      slot: 6,
      subjectId: "MATH-CALC-202",
      subjectName: "MATH CALC 202",
      faculty: "PPG",
      room: "",
      type: "L",
    },
    {
      day: "Tue",
      slot: 7,
      subjectId: "MATH-CALC-202",
      subjectName: "MATH CALC 202",
      faculty: "PPG",
      room: "",
      type: "T",
      group: "G2",
    },
    {
      day: "Tue",
      slot: 11,
      subjectId: "MATH-LA-VR1",
      subjectName: "MATH LA VR 1",
      faculty: "PPG",
      room: "",
      type: "T",
      group: "G3",
    },
    // Wednesday
    {
      day: "Wed",
      slot: 4,
      subjectId: "MATH-CALC-B4",
      subjectName: "MATH CALC B4",
      faculty: "PPG",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 5,
      subjectId: "MATH-LA-202",
      subjectName: "MATH LA 202",
      faculty: "PPG",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 6,
      subjectId: "MATH-ODE-202",
      subjectName: "MATH ODE 202",
      faculty: "SCH",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 7,
      subjectId: "MATH-ODE-202",
      subjectName: "MATH ODE 202",
      faculty: "NKR",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 10,
      subjectId: "MATH-CALC-VR1",
      subjectName: "MATH CALC VR 1",
      faculty: "PPG",
      room: "",
      type: "T",
      group: "G1",
    },
    // Thursday
    {
      day: "Thu",
      slot: 3,
      subjectId: "MATH-CALC-26",
      subjectName: "MATH CALC 26",
      faculty: "GKR",
      room: "",
      type: "L",
    },
    {
      day: "Thu",
      slot: 4,
      subjectId: "MATH-LA-202",
      subjectName: "MATH LA 202",
      faculty: "DK",
      room: "",
      type: "L",
    },
    {
      day: "Thu",
      slot: 5,
      subjectId: "MATH-ODE-LAB-1",
      subjectName: "MATH ODE LAB 1",
      faculty: "SCH",
      room: "",
      type: "LAB",
      group: "G3",
      spanSlots: 2,
    },
    {
      day: "Thu",
      slot: 5,
      subjectId: "MATH-CALC-VR1",
      subjectName: "MATH CALC VR 1",
      faculty: "GKR",
      room: "",
      type: "T",
      group: "G4",
    },
    {
      day: "Thu",
      slot: 6,
      subjectId: "EVS-LAB-1",
      subjectName: "EVS LAB 1",
      faculty: "PRL",
      room: "",
      type: "LAB",
      spanSlots: 2,
    },
    // Friday
    {
      day: "Fri",
      slot: 3,
      subjectId: "MATH-ODE-202",
      subjectName: "MATH ODE 202",
      faculty: "SCH",
      room: "",
      type: "L",
    },
    {
      day: "Fri",
      slot: 4,
      subjectId: "MATH-ODE-202",
      subjectName: "MATH ODE 202",
      faculty: "NKR",
      room: "",
      type: "L",
    },
    {
      day: "Fri",
      slot: 5,
      subjectId: "MATH-LA-B6",
      subjectName: "MATH LA B6",
      faculty: "PPG",
      room: "",
      type: "L",
    },
    {
      day: "Fri",
      slot: 6,
      subjectId: "MATH-ODE-LAB-2",
      subjectName: "MATH ODE LAB 2",
      faculty: "NKR",
      room: "",
      type: "LAB",
      group: "G2",
      spanSlots: 2,
    },
    {
      day: "Fri",
      slot: 7,
      subjectId: "MATH-CALC-4002",
      subjectName: "MATH CALC 4002",
      faculty: "GKR",
      room: "",
      type: "L",
    },
    // Saturday
    {
      day: "Sat",
      slot: 3,
      subjectId: "MATH-CALC-202",
      subjectName: "MATH CALC 202",
      faculty: "GKR",
      room: "",
      type: "L",
    },
    {
      day: "Sat",
      slot: 4,
      subjectId: "MATH-ODE-10",
      subjectName: "MATH ODE 10",
      faculty: "NKR",
      room: "",
      type: "L",
    },
  ],

  // ── English Hons (Image 1) ───────────────────────────────────────────────
  C3: [
    // Monday
    {
      day: "Mon",
      slot: 3,
      subjectId: "ENG-14CEP",
      subjectName: "ENG-14CEP",
      faculty: "VK",
      room: "",
      type: "L",
    },
    {
      day: "Mon",
      slot: 4,
      subjectId: "ENG-16CED",
      subjectName: "ENG-16CED",
      faculty: "VK",
      room: "",
      type: "T",
      group: "G1",
    },
    // Tuesday
    {
      day: "Tue",
      slot: 3,
      subjectId: "ENG-18CL-14",
      subjectName: "ENG-18CL-14",
      faculty: "ML",
      room: "",
      type: "L",
    },
    {
      day: "Tue",
      slot: 4,
      subjectId: "ENG-18CL",
      subjectName: "ENG-18CL",
      faculty: "ML",
      room: "",
      type: "T",
      group: "G1",
    },
    {
      day: "Tue",
      slot: 7,
      subjectId: "ENG-18CL-14",
      subjectName: "ENG-18CL-14",
      faculty: "HS",
      room: "",
      type: "L",
    },
    // Wednesday
    {
      day: "Wed",
      slot: 3,
      subjectId: "ENG-18CL",
      subjectName: "ENG-18CL",
      faculty: "HS",
      room: "",
      type: "T",
      group: "G2",
    },
    {
      day: "Wed",
      slot: 4,
      subjectId: "ENG-16CED",
      subjectName: "ENG-16CED",
      faculty: "VK",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 5,
      subjectId: "ENG-16CED-203",
      subjectName: "ENG-16CED-203",
      faculty: "DPA",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 6,
      subjectId: "ENG-14CEP",
      subjectName: "ENG-14CEP",
      faculty: "ENGG5",
      room: "",
      type: "L",
    },
    {
      day: "Wed",
      slot: 11,
      subjectId: "ENG-18CL",
      subjectName: "ENG-18CL",
      faculty: "ML",
      room: "",
      type: "T",
      group: "G2",
    },
    // Thursday
    {
      day: "Thu",
      slot: 3,
      subjectId: "ENG-16CED",
      subjectName: "ENG-16CED",
      faculty: "VK",
      room: "",
      type: "T",
      group: "G2",
    },
    {
      day: "Thu",
      slot: 4,
      subjectId: "ENG-14CEP",
      subjectName: "ENG-14CEP",
      faculty: "SAK",
      room: "",
      type: "L",
    },
    {
      day: "Thu",
      slot: 5,
      subjectId: "HIN-HNVR1",
      subjectName: "HIN-HNVR1",
      faculty: "",
      room: "",
      type: "L",
    },
    {
      day: "Thu",
      slot: 7,
      subjectId: "ENG-14CEP-2",
      subjectName: "ENG-14CEP-2",
      faculty: "YP",
      room: "",
      type: "T",
      group: "G2",
    },
    // Friday
    {
      day: "Fri",
      slot: 3,
      subjectId: "ENG-16CED",
      subjectName: "ENG-16CED",
      faculty: "AI",
      room: "",
      type: "T",
      group: "G1",
    },
    {
      day: "Fri",
      slot: 4,
      subjectId: "ENG-14CEP",
      subjectName: "ENG-14CEP",
      faculty: "SAK",
      room: "",
      type: "T",
      group: "G1",
    },
    {
      day: "Fri",
      slot: 5,
      subjectId: "ENG-14CEP",
      subjectName: "ENG-14CEP",
      faculty: "ENGG5",
      room: "",
      type: "T",
      group: "G1",
    },
    {
      day: "Fri",
      slot: 7,
      subjectId: "ENG-16CED",
      subjectName: "ENG-16CED",
      faculty: "DPA",
      room: "",
      type: "T",
      group: "G2",
    },
    {
      day: "Fri",
      slot: 11,
      subjectId: "ENG-14CEP",
      subjectName: "ENG-14CEP",
      faculty: "SAK",
      room: "",
      type: "T",
      group: "G2",
    },
    // Saturday
    {
      day: "Sat",
      slot: 5,
      subjectId: "ENG-16CED-203",
      subjectName: "ENG-16CED-203",
      faculty: "AI",
      room: "",
      type: "L",
    },
    {
      day: "Sat",
      slot: 6,
      subjectId: "ENG-16CED-203",
      subjectName: "ENG-16CED-203",
      faculty: "AI",
      room: "",
      type: "L",
    },
    {
      day: "Sat",
      slot: 7,
      subjectId: "ENG-18CL-204",
      subjectName: "ENG-18CL-204",
      faculty: "SS",
      room: "",
      type: "L",
    },
  ],
};

// Summary counts for a timetable
function summarise(data) {
  const lectures = data.filter((e) => e.type === "L").length;
  const tutorials = data.filter((e) => e.type === "T").length;
  const labs = data.filter((e) => e.type === "LAB").length;
  const days = new Set(data.map((e) => e.day)).size;
  return { lectures, tutorials, labs, days };
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function Stat({ label, value, color }) {
  return (
    <div
      className={`flex flex-col items-center px-4 py-2 rounded-xl border ${color}`}
    >
      <span className="text-xl font-black tabular-nums">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GenerateTimetable() {
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("C1");
  const [selectedSemester, setSelectedSemester] = useState("3");
  const [generated, setGenerated] = useState(false);

  const courses = [
    { id: "C1", name: "BSc Computer Science (Hons)" },
    { id: "C2", name: "BSc Mathematics (Hons)" },
    { id: "C3", name: "BA English (Hons)" },
  ];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleGenerate = () => {
    setLoading(true);
    setTimetable([]);
    setGenerated(false);
    setTimeout(() => {
      setTimetable(TIMETABLES[selectedCourse] || []);
      setLoading(false);
      setGenerated(true);
    }, 1100);
  };

  const stats = generated ? summarise(timetable) : null;

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-[1400px] mx-auto">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black dark:text-white flex items-center gap-3 tracking-tighter">
            <Sparkles className="text-green-500 shrink-0" size={28} />
            AI Generation Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate conflict-free timetables for any programme &amp; semester.
          </p>
        </div>

        {generated && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
              ✓ Optimisation Stable
            </span>
          </div>
        )}
      </div>

      {/* ── Control panel ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-100/60 dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          {/* Course selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} /> Degree Programme
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setGenerated(false);
                setTimetable([]);
              }}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold dark:text-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer transition-all"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={12} /> Academic Period
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold dark:text-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer transition-all"
            >
              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all ${
              loading
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg shadow-green-500/25 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Solving…
              </>
            ) : generated ? (
              <>
                <RefreshCw size={16} /> Regenerate
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Timetable
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Stats row (only after generation) ───────────────────────────── */}
      {generated && stats && (
        <div className="flex flex-wrap gap-3 animate-in fade-in duration-500">
          <Stat
            label="Lectures"
            value={stats.lectures}
            color="border-pink-200  dark:border-pink-900  text-pink-600  dark:text-pink-400  bg-pink-50  dark:bg-pink-900/20"
          />
          <Stat
            label="Tutorials"
            value={stats.tutorials}
            color="border-blue-200  dark:border-blue-900  text-blue-600  dark:text-blue-400  bg-blue-50  dark:bg-blue-900/20"
          />
          <Stat
            label="Labs"
            value={stats.labs}
            color="border-teal-200  dark:border-teal-900  text-teal-600  dark:text-teal-400  bg-teal-50  dark:bg-teal-900/20"
          />
          <Stat
            label="Days"
            value={stats.days}
            color="border-gray-200  dark:border-gray-800  text-gray-600  dark:text-gray-400  bg-gray-50  dark:bg-gray-900/40"
          />
        </div>
      )}

      {/* ── Timetable area ───────────────────────────────────────────────── */}
      <div className="relative min-h-[420px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <div className="p-7 bg-green-50 dark:bg-green-900/10 rounded-full">
              <Loader2 className="animate-spin text-green-500" size={44} />
            </div>
            <div className="text-center">
              <p className="font-bold dark:text-white text-base">
                Running optimisation engine…
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Resolving constraints and eliminating clashes
              </p>
            </div>
          </div>
        ) : timetable.length > 0 ? (
          <div className="animate-in slide-in-from-bottom-6 duration-500 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                <CalendarDays size={14} />
                {courses.find((c) => c.id === selectedCourse)?.name} — Semester{" "}
                {selectedSemester}
              </div>
              <button className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold transition-colors">
                <Download size={13} /> Export
              </button>
            </div>
            <TimetableGrid timetableData={timetable} />
          </div>
        ) : (
          <div className="h-[420px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-center px-6">
            <AlertCircle
              size={44}
              strokeWidth={1}
              className="mb-4 text-gray-200 dark:text-gray-700"
            />
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-600">
              Select a programme &amp; semester, then click Generate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}