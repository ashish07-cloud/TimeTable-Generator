import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  DoorOpen,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import BulkUploadZone from "./BulkUploadZone";
import dataService from "../../api/dataService";
import * as XLSX from "xlsx";

const ROOM_TYPES = [
  "LECTURE_HALL",
  "COMPUTER_LAB",
  "PHYSICS_LAB",
  "CHEMISTRY_LAB",
  "BIOLOGY_LAB",
  "SEMINAR_HALL",
];

const RoomManager = () => {
  const { progress, saveAndNext, handleNavigate, isLoading } = useOutletContext();

  const [rooms, setRooms] = useState([]);
  const [showBulk, setShowBulk] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    roomType: "LECTURE_HALL",
    capacity: 60,
    building: "",
    floor: "",
  });

  // --- 1. SYNC WITH DATABASE ---
  useEffect(() => {
    if (progress) {
      if (progress.rooms && progress.rooms.length > 0) {
        setRooms(progress.rooms.map((r, i) => ({ ...r, id: r.id || `db-${i}` })));
      }
      if (progress.step >= 3) {
        setIsLocked(true);
      }
    }
  }, [progress]);

  // --- 2. MANUAL HANDLERS ---
  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.capacity) return;
    setRooms([...rooms, { ...newRoom, id: Date.now() }]);
    setNewRoom({ roomNumber: "", roomType: "LECTURE_HALL", capacity: 60, building: "", floor: "" });
  };

  const removeRoom = (id) => {
    if (isLocked) return;
    setRooms(rooms.filter((r) => r.id !== id));
  };

  // --- 3. BULK UPLOAD & TEMPLATE ---
  const handleBulkUpload = (data) => {
    const normalized = data.map((r, index) => ({
      id: Date.now() + index,
      roomNumber: String(r.room_number || r.roomNumber || "").toUpperCase(),
      roomType: String(r.room_type || r.roomType || "LECTURE_HALL").toUpperCase().replace(/\s+/g, "_"),
      capacity: parseInt(r.capacity, 10) || 60,
      building: r.building || "",
      floor: r.floor ? parseInt(r.floor, 10) : null,
    }));

    const existingNumbers = new Set(rooms.map(r => r.roomNumber));
    const uniqueNew = normalized.filter(r => !existingNumbers.has(r.roomNumber));

    setRooms([...rooms, ...uniqueNew]);
    setShowBulk(false);
  };

  const downloadTemplate = () => {
    const data = [
      {
        room_number: "A101",
        room_type: "LECTURE_HALL",
        capacity: 60,
        building: "Main Block",
        floor: 1,
      },
      {
        room_number: "L202",
        room_type: "COMPUTER_LAB",
        capacity: 30,
        building: "Science Wing",
        floor: 2,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rooms");
    XLSX.writeFile(wb, "rooms_template.xlsx");
  };

  // --- 4. SMART SUBMIT ---
  const handleSubmit = async () => {
    if (isLocked || (rooms.length > 0 && progress?.step >= 2)) {
      await saveAndNext();
      return;
    }

    if (rooms.length === 0) {
      alert("Please add at least one room.");
      return;
    }

    const payload = rooms.map((r) => {
      const parsedFloor = parseInt(r.floor, 10);
      return {
        roomNumber: String(r.roomNumber).trim(),
        capacity: parseInt(r.capacity, 10) || 60, 
        roomType: r.roomType, 
        building: r.building ? String(r.building).trim() : null,
        floor: isNaN(parsedFloor) ? null : parsedFloor, 
      };
    });

    try {
      await saveAndNext(payload, dataService.saveRooms);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "";
      if (errorMsg.toLowerCase().includes("unique") || errorMsg.includes("Validation error")) {
        await saveAndNext(); 
      } else {
        alert(`Save failed: ${errorMsg || "Validation Error"}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isLocked && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 shadow-sm">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Infrastructure verified. You can proceed to Subjects.</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><DoorOpen size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rooms</p>
            <p className="text-xl font-bold dark:text-white">{rooms.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Capacity</p>
            <p className="text-xl font-bold dark:text-white">{rooms.reduce((acc, r) => acc + parseInt(r.capacity || 0), 0)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Building2 size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Labs</p>
            <p className="text-xl font-bold dark:text-white">{rooms.filter(r => r.roomType?.includes("LAB")).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold dark:text-white flex items-center gap-2 text-gray-900">
                {showBulk ? <FileSpreadsheet size={18} className="text-orange-500" /> : <Plus size={18} className="text-orange-500" />}
                {showBulk ? "Bulk Import" : "Manual Entry"}
              </h3>
              {!isLocked && (
                <button
                  onClick={() => setShowBulk(!showBulk)}
                  className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md"
                >
                  {showBulk ? "Cancel" : "Use Excel"}
                </button>
              )}
            </div>
            
            {!isLocked && (
              <>
                {showBulk ? (
                  <div className="space-y-4">
                    <BulkUploadZone type="Rooms" onUpload={handleBulkUpload} />
                    <button
                      onClick={downloadTemplate}
                      className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Template
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      value={newRoom.roomNumber}
                      onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value.toUpperCase() })}
                      placeholder="Room Number"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <select
                      value={newRoom.roomType}
                      onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                        placeholder="Capacity"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="number"
                        value={newRoom.floor}
                        onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                        placeholder="Floor"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button onClick={handleAddRoom} className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600">
                      Add to List
                    </button>
                  </div>
                )}
              </>
            )}
            {isLocked && <p className="text-sm text-gray-500 italic mt-4">Configuration is locked.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
             <div className="overflow-x-auto max-h-[550px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10 border-b">
                  <tr className="text-[10px] uppercase text-gray-400 font-bold">
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-center">Capacity</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic text-sm">
                        No rooms added yet.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-200">{room.roomNumber}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">{room.roomType?.replace("_", " ")}</td>
                        <td className="px-6 py-4 text-center font-mono">{room.capacity}</td>
                        <td className="px-6 py-4 text-right">
                          {!isLocked && (
                            <button onClick={() => removeRoom(room.id)} className="text-gray-400 hover:text-red-500">
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

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => handleNavigate("prev")}
              className="px-6 py-3 rounded-lg border text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading || (rooms.length === 0 && !isLocked)}
              className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                isLoading ? "bg-gray-200 text-gray-500" : "bg-gradient-to-r from-orange-500 to-orange-700 text-white"
              }`}
            >
              {isLoading ? "Saving..." : (isLocked || rooms.length > 0) ? "Next: Subjects" : "Save & Continue"}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;