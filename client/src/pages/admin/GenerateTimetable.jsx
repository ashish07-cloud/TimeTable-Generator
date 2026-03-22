import React, { useState } from 'react';
import { generateTimetable } from '../../api/timetableService';
import TimetableGrid from '../../components/timetable/TimetableGrid';

const GenerateTimetable = () => {
    const [loading, setLoading] = useState(false);
    const [timetable, setTimetable] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // In a real scenario, this data comes from your Form/DB state
            const mockData = { subjects: [], faculty: [], rooms: [], sections: [], time_slots: [] };
            const result = await generateTimetable(mockData);
            if (result.status === 'success') {
                setTimetable(result.data);
            }
        } catch (err) {
            alert("Generation failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">NEP Timetable Generator</h1>
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? 'Generating Engine...' : 'Generate New Timetable'}
            </button>

            {timetable && (
                <div className="mt-8">
                    <TimetableGrid data={timetable} />
                </div>
            )}
        </div>
    );
};

export default GenerateTimetable;