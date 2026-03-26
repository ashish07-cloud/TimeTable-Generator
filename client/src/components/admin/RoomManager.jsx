import React, { useState } from "react";
import {
  Plus,
  Trash2,
  DoorOpen,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
} from "lucide-react";
import BulkUploadZone from "./BulkUploadZone";
import dataService from "../../api/dataService";
import { useOnboarding } from "../../hooks/useOnboarding";

const ROOM_TYPES = [
  "LECTURE_HALL",
  "COMPUTER_LAB",
  "PHYSICS_LAB",
  "CHEMISTRY_LAB",
  "BIOLOGY_LAB",
  "SEMINAR_HALL",
];

const RoomManager = ({ onNext, onPrev, isLoading: parentLoading }) => {
  const [rooms, setRooms] = useState([]);
  const [showBulk, setShowBulk] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    roomType: "LECTURE_HALL",
    capacity: 60,
    building: "",
    floor: "",
  });

  // Renamed hook's isLoading to isProcessing to avoid collision with the prop
  const { goToNextStep, isLoading: isProcessing } = useOnboarding();

  const combinedLoading = parentLoading || isProcessing;

  const handleSubmit = async () => {
    if (rooms.length === 0) return;

    const payload = rooms.map((r) => ({
      roomNumber: r.roomNumber,
      capacity: Number(r.capacity),
      roomType: r.roomType?.toUpperCase().replace(/\s+/g, "_"), // 🔥 FIX
      building: r.building || null,
      floor: r.floor || null,
      features: r.features || {},
    }));

    // Logic to save and move to next step
    goToNextStep(payload, dataService.saveRooms);
    if (onNext) onNext(payload);
  };

  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.capacity) return;
    setRooms([...rooms, { ...newRoom, id: Date.now() }]);
    setNewRoom({
      roomNumber: "",
      roomType: "LECTURE_HALL",
      capacity: 60,
      building: "",
      floor: "",
    });
  };

  const removeRoom = (id) => setRooms(rooms.filter((r) => r.id !== id));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
            <DoorOpen size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Rooms</p>
            <p className="text-xl font-bold dark:text-white">{rooms.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Capacity</p>
            <p className="text-xl font-bold dark:text-white">
              {rooms.reduce((acc, r) => acc + parseInt(r.capacity || 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Lab Units</p>
            <p className="text-xl font-bold dark:text-white">
              {rooms.filter((r) => r.roomType.includes("LAB")).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-green-600" /> Infrastructure
              </h3>
              <button
                onClick={() => setShowBulk(!showBulk)}
                className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md"
              >
                {showBulk ? "Manual Entry" : "Bulk Upload"}
              </button>
            </div>

            {showBulk ? (
              <BulkUploadZone
                type="Rooms"
                expectedHeaders={[
                  "room_number",
                  "capacity",
                  "room_type",
                  "building",
                  "floor",
                ]}
                onUpload={(data) => {
                  const normalized = data.map((r) => ({
                    id: Date.now() + Math.random(),
                    roomNumber: r.room_number,
                    roomType: r.room_type?.toUpperCase().replace(/\s+/g, "_"),
                    capacity: Number(r.capacity) || 60,
                    building: r.building || "",
                    floor: r.floor || "",
                    features: {},
                  }));
                  setRooms((prev) => [...prev, ...normalized]);
                  setShowBulk(false);
                }}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Room Number / ID
                  </label>
                  <input
                    value={newRoom.roomNumber}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, roomNumber: e.target.value })
                    }
                    placeholder="e.g. LH-101"
                    className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Room Type
                  </label>
                  <select
                    value={newRoom.roomType}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, roomType: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, capacity: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={newRoom.floor}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, floor: e.target.value })
                      }
                      placeholder="e.g. 2nd"
                      className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddRoom}
                  disabled={!newRoom.roomNumber}
                  className="w-full py-3 mt-2 bg-gray-900 dark:bg-green-700 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-green-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add to List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table/List Section */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex-1">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold dark:text-white">Infrastructure List</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
                  <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4 font-bold">Room</th>
                    <th className="px-6 py-4 font-bold">Type</th>
                    <th className="px-6 py-4 font-bold text-center">
                      Capacity
                    </th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rooms.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-400 italic text-sm"
                      >
                        No infrastructure added yet.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr
                        key={room.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold dark:text-gray-200 text-sm">
                          {room.roomNumber}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                            {room.roomType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-sm dark:text-gray-300">
                          {room.capacity}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeRoom(room.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
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

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onPrev}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={rooms.length === 0 || combinedLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {combinedLoading ? "Processing..." : "Save & Next"}{" "}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;
