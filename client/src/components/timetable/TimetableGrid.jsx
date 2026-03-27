// TimetableGrid.jsx
// Renders a proper institutional timetable:
//   • Time slots as column headers (8:30–9:30, 9:30–10:30 … 6:30–7:30)
//   • Days as rows (Mon–Sat)
//   • Color-coded by type: Lecture (pink/rose), Tutorial (blue), Lab (teal)
//   • Labs span 2 consecutive slots visually
//   • Dark / Light theme aware via Tailwind dark: classes

import React, { useMemo } from "react";

const TIME_SLOTS = [
  { id: 1, label: "8:30–9:30" },
  { id: 2, label: "9:30–10:30" },
  { id: 3, label: "10:30–11:30" },
  { id: 4, label: "11:30–12:30" },
  { id: 5, label: "12:30–1:30" },
  { id: 6, label: "1:30–2:30" },
  { id: 7, label: "2:30–3:30" },
  { id: 8, label: "3:30–4:30" },
  { id: 9, label: "4:30–5:30" },
  { id: 10, label: "5:30–6:30" },
  { id: 11, label: "6:30–7:30" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Returns styling info based on entry type
function getTypeStyle(entry) {
  const name = (entry.subjectName || entry.subjectId || "").toLowerCase();
  const type = (entry.type || "").toLowerCase();

  const isLab = type === "lab" || name.includes("lab") || entry.spanSlots > 1;
  const isTutorial =
    type === "tutorial" ||
    type === "t" ||
    name.startsWith("t-") ||
    (entry.prefix || "").toUpperCase() === "T";
  const isLecture =
    type === "lecture" ||
    type === "l" ||
    name.startsWith("l-") ||
    (!isLab && !isTutorial);

  if (isLab) {
    return {
      tag: "LAB",
      tagBg: "bg-teal-600",
      cellBg: "bg-teal-50 dark:bg-teal-900/30",
      border: "border-teal-300 dark:border-teal-700",
      subjectColor: "text-teal-800 dark:text-teal-200",
      metaColor: "text-teal-600 dark:text-teal-400",
      tagText: "text-white",
      dot: "bg-teal-500",
    };
  }
  if (isTutorial) {
    return {
      tag: "T",
      tagBg: "bg-blue-500",
      cellBg: "bg-blue-50 dark:bg-blue-900/30",
      border: "border-blue-300 dark:border-blue-700",
      subjectColor: "text-blue-900 dark:text-blue-100",
      metaColor: "text-blue-600 dark:text-blue-400",
      tagText: "text-white",
      dot: "bg-blue-400",
    };
  }
  // Lecture
  return {
    tag: "L",
    tagBg: "bg-pink-500",
    cellBg: "bg-pink-50 dark:bg-pink-900/30",
    border: "border-pink-300 dark:border-pink-700",
    subjectColor: "text-pink-900 dark:text-pink-100",
    metaColor: "text-pink-600 dark:text-pink-400",
    tagText: "text-white",
    dot: "bg-pink-400",
  };
}

// Build a 2-D grid map: grid[day][slot] = { entry, colSpan, hidden }
function buildGrid(data) {
  // grid[day][slot] = array of entries
  const raw = {};
  DAYS.forEach((d) => {
    raw[d] = {};
    TIME_SLOTS.forEach((s) => {
      raw[d][s.id] = [];
    });
  });

  data.forEach((entry) => {
    const day = entry.day;
    const slot = entry.slot; // 1-based
    if (!raw[day] || !raw[day][slot]) return;
    raw[day][slot].push(entry);
  });

  return raw;
}

// Determine if a slot should be skipped because it's spanned by a lab from previous slot
function buildSpanMap(data) {
  // spanMap[day][slot] = true means this cell is eaten by a spanning lab
  const spanMap = {};
  DAYS.forEach((d) => {
    spanMap[d] = {};
  });

  data.forEach((entry) => {
    const span = entry.spanSlots || 1;
    if (span > 1) {
      for (let i = 1; i < span; i++) {
        const hiddenSlot = entry.slot + i;
        if (spanMap[entry.day]) {
          spanMap[entry.day][hiddenSlot] = true;
        }
      }
    }
  });
  return spanMap;
}

// Single entry card inside a cell
function EntryCard({ entry }) {
  const style = getTypeStyle(entry);
  const span = entry.spanSlots || 1;
  const displayName = entry.subjectName || entry.subjectId || "—";

  return (
    <div
      className={`
        rounded-lg border px-2 py-1.5 text-[11px] leading-tight
        ${style.cellBg} ${style.border}
        transition-all duration-150 hover:brightness-95
      `}
    >
      {/* Type tag + subject */}
      <div className="flex items-start gap-1.5 mb-1">
        <span
          className={`
            inline-flex items-center justify-center
            rounded-[4px] px-1.5 py-0.5 text-[9px] font-black tracking-wider shrink-0
            ${style.tagBg} ${style.tagText}
          `}
        >
          {style.tag}
        </span>
        <span className={`font-bold leading-tight ${style.subjectColor}`}>
          {displayName}
        </span>
      </div>

      {/* Faculty */}
      {entry.faculty && (
        <div className={`text-[10px] ${style.metaColor} truncate`}>
          {entry.faculty}
        </div>
      )}

      {/* Room */}
      {entry.room && (
        <div className={`text-[10px] ${style.metaColor}`}>📍 {entry.room}</div>
      )}

      {/* Group */}
      {entry.group && (
        <div className={`text-[10px] font-semibold ${style.metaColor}`}>
          {entry.group}
        </div>
      )}

      {/* Span indicator for labs */}
      {span > 1 && (
        <div className="mt-1 text-[9px] text-teal-500 dark:text-teal-400 font-mono">
          {"←" + "─".repeat(8) + "→"}
        </div>
      )}
    </div>
  );
}

export default function TimetableGrid({ timetableData = [] }) {
  const grid = useMemo(() => buildGrid(timetableData), [timetableData]);
  const spanMap = useMemo(() => buildSpanMap(timetableData), [timetableData]);

  // Only show slots that have at least one entry (+ neighbours), to avoid giant empty table
  const usedSlots = useMemo(() => {
    const used = new Set();
    timetableData.forEach((e) => {
      const span = e.spanSlots || 1;
      for (let i = 0; i < span; i++) used.add(e.slot + i);
    });
    if (used.size === 0) return TIME_SLOTS; // show all if nothing
    // always show contiguous range
    const min = Math.min(...used);
    const max = Math.max(...used);
    return TIME_SLOTS.filter((s) => s.id >= min && s.id <= max);
  }, [timetableData]);

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
      <table className="min-w-full border-collapse text-sm font-sans">
        {/* ── Column headers: time slots ─────────────────────────────── */}
        <thead>
          <tr>
            {/* Day label column */}
            <th
              className="
              sticky left-0 z-20 bg-white dark:bg-gray-950
              border-b border-r border-gray-200 dark:border-gray-800
              px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest
              text-gray-400 dark:text-gray-600 min-w-[72px]
            "
            >
              Day
            </th>
            {usedSlots.map((slot) => (
              <th
                key={slot.id}
                className="
                  border-b border-r border-gray-200 dark:border-gray-800
                  bg-gray-50 dark:bg-gray-900
                  px-3 py-3 text-center
                  text-[10px] font-black uppercase tracking-wider
                  text-gray-500 dark:text-gray-400
                  min-w-[130px] whitespace-nowrap
                "
              >
                {slot.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Rows: days ─────────────────────────────────────────────── */}
        <tbody>
          {DAYS.map((day, di) => (
            <tr
              key={day}
              className={
                di % 2 === 0
                  ? "bg-white dark:bg-gray-950"
                  : "bg-gray-50/60 dark:bg-gray-900/40"
              }
            >
              {/* Day label */}
              <td
                className="
                sticky left-0 z-10
                border-b border-r border-gray-200 dark:border-gray-800
                bg-inherit px-4 py-3
                text-[11px] font-black uppercase tracking-widest
                text-gray-500 dark:text-gray-400
              "
              >
                {day}
              </td>

              {usedSlots.map((slot) => {
                // Is this cell consumed by a spanning lab from the left?
                if (spanMap[day]?.[slot.id]) return null;

                const entries = grid[day]?.[slot.id] || [];

                // Compute colSpan: if top entry spans, use its span (capped by available slots)
                let colSpan = 1;
                if (entries.length === 1 && (entries[0].spanSlots || 1) > 1) {
                  colSpan = Math.min(
                    entries[0].spanSlots,
                    usedSlots.length -
                      usedSlots.findIndex((s) => s.id === slot.id),
                  );
                }

                return (
                  <td
                    key={slot.id}
                    colSpan={colSpan}
                    className="
                      border-b border-r border-gray-200 dark:border-gray-800
                      p-2 align-top
                      min-w-[130px]
                    "
                    style={{ minHeight: "80px" }}
                  >
                    {entries.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {entries.map((entry, i) => (
                          <EntryCard key={i} entry={entry} />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[60px] flex items-center justify-center">
                        <span className="text-gray-200 dark:text-gray-800 text-xs">
                          —
                        </span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div
        className="
        flex items-center gap-5 px-5 py-3
        border-t border-gray-200 dark:border-gray-800
        bg-gray-50 dark:bg-gray-900/60
      "
      >
        {[
          { tag: "L", label: "Lecture", bg: "bg-pink-500" },
          { tag: "T", label: "Tutorial", bg: "bg-blue-500" },
          { tag: "LAB", label: "Lab", bg: "bg-teal-600" },
        ].map(({ tag, label, bg }) => (
          <div key={tag} className="flex items-center gap-2">
            <span
              className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded ${bg}`}
            >
              {tag}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {label}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-gray-300 dark:text-gray-700 font-mono">
          Hover cells for details
        </span>
      </div>
    </div>
  );
}