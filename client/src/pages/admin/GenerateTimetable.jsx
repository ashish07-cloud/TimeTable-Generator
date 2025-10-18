import { useState, useEffect } from 'react';
import { timetableAPI } from '../../services/api';
import outputTimetable from '../../../algorithm/output_timetable.json'

export default function TimetableGenerator() {
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({ node: false, python: false });
  const [activeView, setActiveView] = useState('master');

  // Updated form data to match your actual data structure
  const [formData] = useState({
    rooms: [
      { id: 'R01', type: 'Lecture Hall', capacity: 60 },
      { id: 'R02', type: 'Lecture Hall', capacity: 60 },
      { id: 'R03', type: 'Lecture Hall', capacity: 60 },
      { id: 'R04', type: 'Lab', capacity: 30 },
      { id: 'R05', type: 'Lab', capacity: 30 },
    ],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });

  // Extract unique time slots from your data
  const getTimeSlots = () => {
    if (!timetable?.master?.Monday) return [];
    
    const timeSlots = Object.keys(timetable.master.Monday);
    // Convert "Mon 09:00-10:00" to "09:00-10:00" for display
    return timeSlots.map(slot => slot.replace(/^[A-Za-z]+ /, ''));
  };

  // Load existing timetable on mount
    useEffect(() => {
    const fetchTimetable = async () => {
      try {
        // Use the imported JSON data directly
        setTimetable(outputTimetable);
        
        // Or uncomment below to use actual API:
        // const data = await timetableAPI.getTimetable();
        // if (data.success) setTimetable(data.timetable);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
      }
    };
    fetchTimetable();
    checkServices();
  }, []);


  // Check Node & Python service status
  const checkServices = async () => {
    try {
      await timetableAPI.checkHealth();
      setServiceStatus(prev => ({ ...prev, node: true }));

      const pythonStatus = await timetableAPI.checkPythonService();
      setServiceStatus(prev => ({ ...prev, python: pythonStatus.pythonServiceStatus === 'connected' }));
    } catch (err) {
      console.error('Service check failed:', err);
    }
  };

  // Render Master View - FIXED
  // Render Master View - FIXED
// Render Master View - SIMPLER FIX
const renderMasterView = () => {
  if (!timetable?.master) return <p className="text-gray-500">No Master timetable found.</p>;

  // Define the time slots you want to display for each day
  const dayTimeSlots = {
    'Monday': ['Mon 09:00-10:00', 'Mon 10:00-11:00', 'Mon 11:00-12:00', 'Mon 12:00-13:00', 'Mon 13:00-14:00', 'Mon 14:00-15:00', 'Mon 15:00-16:00'],
    'Tuesday': ['Tue 09:00-10:00', 'Tue 10:00-11:00', 'Tue 11:00-12:00', 'Tue 12:00-13:00', 'Tue 13:00-14:00', 'Tue 14:00-15:00', 'Tue 15:00-16:00'],
    'Wednesday': ['Wed 09:00-10:00', 'Wed 10:00-11:00', 'Wed 11:00-12:00', 'Wed 12:00-13:00', 'Wed 13:00-14:00', 'Wed 14:00-15:00', 'Wed 15:00-16:00'],
    'Thursday': ['Thu 09:00-10:00', 'Thu 10:00-11:00', 'Thu 11:00-12:00', 'Thu 12:00-13:00', 'Thu 13:00-14:00', 'Thu 14:00-15:00', 'Thu 15:00-16:00'],
    'Friday': ['Fri 09:00-10:00', 'Fri 10:00-11:00', 'Fri 11:00-12:00', 'Fri 12:00-13:00', 'Fri 13:00-14:00', 'Fri 14:00-15:00', 'Fri 15:00-16:00']
  };

  return (
    <div className="overflow-x-auto">
      {formData.days.map(day => (
        <div key={day} className="mb-6">
          <h4 className="font-bold text-lg mb-2 text-blue-600">{day}</h4>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Time Slot</th>
                {formData.rooms.map(room => (
                  <th key={room.id} className="border border-gray-300 px-4 py-2">{room.id}</th>
                ))}
              </tr>
            </thead>  
            <tbody>
              {dayTimeSlots[day].map(timeSlot => (
                <tr key={`${day}-${timeSlot}`}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {timeSlot.replace(/^[A-Za-z]+ /, '')}
                  </td>
                  {formData.rooms.map(room => {
                    const slot = timetable.master[day]?.[timeSlot]?.[room.id];
                    return (
                      <td key={room.id} className="border border-gray-300 px-4 py-2">
                        {slot ? (
                          <div className="text-sm p-2 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-600">{slot.course_code}</div>
                            <div className="text-xs text-gray-600">{slot.course_name}</div>
                            <div className="text-xs text-gray-500">{slot.type} • Sem {slot.semester}</div>
                            {slot.faculty_id && (
                              <div className="text-xs text-gray-500">Faculty: {slot.faculty_id}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

  // Render Faculty View
  const renderFacultyView = () => {
    if (!timetable?.faculty) return <p className="text-gray-500">No Faculty schedule found.</p>;

    return (
      <div>
        {Object.entries(timetable.faculty).map(([facultyId, schedules]) => (
          <div key={facultyId} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold text-lg mb-3 text-green-600">Faculty {facultyId}</h4>
            {schedules.length === 0 ? (
              <p className="text-gray-500">No classes assigned</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedules.map((s, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="font-semibold">{s.course_code}</div>
                    <div className="text-sm text-gray-600">{s.course_name}</div>
                    <div className="text-sm">{s.day} - {s.start_time}</div>
                    <div className="text-sm text-gray-500">Room: {s.room_id} • {s.type}</div>
                    <div className="text-sm text-gray-500">Semester: {s.semester}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render Semester View
  const renderSemesterView = () => {
    if (!timetable?.semester) return <p className="text-gray-500">No Semester schedule found.</p>;

    return (
      <div>
        {Object.entries(timetable.semester).map(([sem, schedules]) => (
          <div key={sem} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold text-lg mb-3 text-purple-600">Semester {sem}</h4>
            {schedules.length === 0 ? (
              <p className="text-gray-500">No classes assigned</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedules.map((s, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                    <div className="font-semibold">{s.course_code}</div>
                    <div className="text-sm text-gray-600">{s.course_name}</div>
                    <div className="text-sm">{s.day} - {s.start_time}</div>
                    <div className="text-sm text-gray-500">Room: {s.room_id} • {s.type}</div>
                    <div className="text-sm text-gray-500">
                      Faculty: {s.faculty_id || 'Not assigned'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Smart Timetable Generator</h1>
        <p className="text-gray-600 mb-6">AI-powered automatic timetable scheduling</p>

        {/* Service Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Service Status</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${serviceStatus.node ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Node.js Server</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${serviceStatus.python ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Python Service</span>
            </div>
          </div>
          {!serviceStatus.python && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Python service not running. Please start Flask server on port 5000.
            </p>
          )}
        </div>

        {/* Timetable Views */}
        {timetable && (
          <div className="mt-6">
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveView('master')}
                className={`px-4 py-2 font-medium ${activeView === 'master' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Master View
              </button>
              <button
                onClick={() => setActiveView('faculty')}
                className={`px-4 py-2 font-medium ${activeView === 'faculty' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Faculty View
              </button>
              <button
                onClick={() => setActiveView('semester')}
                className={`px-4 py-2 font-medium ${activeView === 'semester' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Semester View
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg">
              {activeView === 'master' && renderMasterView()}
              {activeView === 'faculty' && renderFacultyView()}
              {activeView === 'semester' && renderSemesterView()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}