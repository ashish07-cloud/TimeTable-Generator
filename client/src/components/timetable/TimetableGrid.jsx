const TimetableGrid = ({ timetableData }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Time</th>
            {days.map(day => <th key={day} className="border p-2">{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot}>
              <td className="border p-2 font-bold">Period {slot}</td>
              {days.map(day => {
                // Find the assignment for this specific Day and Slot
                const entry = timetableData.find(e => e.day === day && e.slot === slot);
                return (
                  <td key={day + slot} className="border p-4 h-24 w-40 bg-blue-50">
                    {entry ? (
                      <div>
                        <p className="font-bold text-blue-800">{entry.subjectId}</p>
                        <p className="text-xs text-gray-600">Room: {entry.room}</p>
                      </div>
                    ) : (
                      <span className="text-gray-300">Free</span>
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