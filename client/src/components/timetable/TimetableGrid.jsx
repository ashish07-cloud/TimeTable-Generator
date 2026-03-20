import React from 'react';

const TimetableGrid = ({ timetableData }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8];

  const theme = {
    bg: "bg-white dark:bg-black",
    text: "text-gray-900 dark:text-white",
    card: "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
    accentGreen: "from-green-500 to-green-700 text-white"
  };

  return (
    <div className={`w-full overflow-x-auto rounded-xl border p-4 ${theme.bg} ${theme.card}`}>
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className={`p-4 text-left ${theme.text}`}>Slot / Day</th>
            {days.map(day => <th key={day} className={`p-4 text-center ${theme.text}`}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              <td className="p-4 font-bold text-green-600">Slot {slot}</td>
              {days.map(day => {
                const entry = timetableData.find(i => i.day === day && i.slot === slot);
                return (
                  <td key={`${day}-${slot}`} className="p-2">
                    {entry ? (
                      <div className={`rounded-lg bg-gradient-to-br p-3 shadow-md ${theme.accentGreen}`}>
                        <div className="text-xs font-bold opacity-80">{entry.subjectCode}</div>
                        <div className="text-sm font-semibold truncate">{entry.subjectName}</div>
                        <div className="mt-2 flex justify-between text-[10px] font-medium uppercase">
                          <span>📍 {entry.room}</span>
                          <span>👤 {entry.faculty.split(' ')[0]}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 rounded-lg border-2 border-dashed border-gray-100 dark:border-gray-800" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;