import React, { useState, useMemo, useEffect } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  UserCheck,
  BookOpen,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Search,
  Users,
  Filter,
} from "lucide-react";
import { useOutletContext } from "react-router-dom"; // 🔥 Using context for smooth flow
import dataService from "../../api/dataService";
import BulkUploadZone from "./BulkUploadZone";

const FacultyManager = () => {
  // 🔥 Sync with the Onboarding Wizard Context (Step 4)
  const { progress, saveAndNext, handleNavigate, isLoading: isSubmitting } = useOutletContext();

  // --- STATE ---
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLocked, setIsLocked] = useState(false); // 🔥 Track step completion

  // --- 1. SYNC WITH DATABASE PROGRESS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetchingSubjects(true);
        
        // Load subjects from database (Step 3)
        const subRes = await dataService.getSubjects();
        setAvailableSubjects(subRes.data || []);

        // 🔥 PERSISTENCE: If faculty already exists in progress, load them
        if (progress) {
          if (progress.faculty && progress.faculty.length > 0) {
            // Map DB faculty to the local state format (tempId and expertiseIds)
            const formatted = progress.faculty.map((f, idx) => ({
              ...f,
              tempId: f.id || `fac-${Date.now()}-${idx}`,
              // Ensure we use the right key for subjects (expertiseIds or subjectIds)
              expertiseIds: f.expertiseIds || f.QualifiedSubjects?.map(s => s.id) || []
            }));
            setFacultyList(formatted);
          }

          // 🔥 LOCKING: If we are at Step 5 (Enrollment) or higher, Step 4 is locked
          if (progress.step >= 5) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Critical Error: Could not sync faculty/subject data.", err);
      } finally {
        setFetchingSubjects(false);
      }
    };
    loadData();
  }, [progress]);

  // --- 2. DYNAMIC LOGIC ---
  const selectedFaculty = useMemo(
    () => facultyList.find((f) => f.tempId === selectedFacultyId),
    [facultyList, selectedFacultyId],
  );

  // Auto-filter subjects matching the selected faculty's department
  const subjectsInDept = useMemo(() => {
    if (!selectedFaculty) return [];
    return availableSubjects.filter(
      (s) => s.department === selectedFaculty.department,
    );
  }, [availableSubjects, selectedFaculty]);

  // Search/Filter faculty list
  const filteredFacultyList = useMemo(() => {
    return facultyList.filter(
      (f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [facultyList, searchTerm]);

  // --- 3. HANDLERS ---
  const handleBulkUpload = (data) => {
    if (isLocked) return;

    const seenEmails = new Set();
    const seenIds = new Set();
    const duplicates = [];

    const normalized = data.map((d, index) => {
      const email = d.email?.trim().toLowerCase();
      const empId = d.employeeId?.toString().trim();

      if (seenEmails.has(email)) duplicates.push(`Duplicate Email: ${email}`);
      if (seenIds.has(empId)) duplicates.push(`Duplicate ID: ${empId}`);

      seenEmails.add(email);
      seenIds.add(empId);

      return {
        tempId: `fac-${Date.now()}-${index}`,
        name: d.name?.trim() || "",
        email: email || "",
        employeeId: empId || "",
        department: d.department?.trim() || "",
        designation: d.designation?.trim() || "Assistant Professor",
        maxWeeklyLoad: parseInt(d.maxWeeklyLoad) || 16,
        expertiseIds: [],
      };
    });

    if (duplicates.length > 0) {
      alert("Upload Blocked! Found duplicates in CSV:\n" + duplicates.join("\n"));
      return;
    }

    const valid = normalized.every((f) => f.name && f.email && f.employeeId && f.department);
    if (!valid) {
      alert("Validation Error: Some rows are missing mandatory fields.");
      return;
    }

    setFacultyList(normalized);
  };

  const toggleSubject = (subjectId) => {
    if (isLocked) return;
    setFacultyList((prev) =>
      prev.map((f) => {
        if (f.tempId !== selectedFacultyId) return f;
        const exists = f.expertiseIds.includes(subjectId);
        return {
          ...f,
          expertiseIds: exists
            ? f.expertiseIds.filter((id) => id !== subjectId)
            : [...f.expertiseIds, subjectId],
        };
      }),
    );
  };

  const handleFinalSave = async () => {
    // 🔥 FLOW: If data is already in DB and verified, move forward
    if (isLocked || (facultyList.length > 0 && progress?.step >= 4)) {
      await saveAndNext();
      return;
    }

    if (facultyList.length === 0)
      return alert("Please upload the faculty CSV first.");

    const payload = facultyList.map((f) => ({
      name: f.name,
      email: f.email,
      employeeId: f.employeeId,
      department: f.department,
      designation: f.designation,
      maxWeeklyLoad: f.maxWeeklyLoad,
      expertiseIds: f.expertiseIds,
    }));

    try {
      // Saves payload to DB and triggers navigation to Enrollment
      await saveAndNext(payload, dataService.saveFaculty);
    } catch (err) {
      // Emergency bypass for duplicates
      if (err.response?.status === 400) {
        await saveAndNext();
      } else {
        alert("Failed to sync faculty registry.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 🔒 STATUS BAR */}
      {isLocked && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">Faculty Registry confirmed. Proceed to Step 5.</span>
        </div>
      )}

      {/* TOP BAR: STATS & UPLOAD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Faculty</p>
            <p className="text-2xl font-black dark:text-white">{facultyList.length}</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-gradient-to-r from-orange-500 to-orange-700 p-1 rounded-2xl shadow-lg shadow-orange-500/20">
          <div className="bg-white dark:bg-gray-800/50 rounded-[14px] h-full flex items-center px-4 py-2">
            {!isLocked ? (
              <BulkUploadZone
                type="Faculty"
                onUpload={handleBulkUpload}
                customLabel="Click to Upload Faculty CSV"
              />
            ) : (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold px-4 py-2">
                <CheckCircle2 size={20} /> Registry Uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: SEARCHABLE LIST */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  placeholder="Search name or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
              {filteredFacultyList.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <FileSpreadsheet size={40} className="text-gray-200 dark:text-gray-700 mb-2" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">No faculty data available.</p>
                </div>
              ) : (
                filteredFacultyList.map((f) => (
                  <div
                    key={f.tempId}
                    onClick={() => setSelectedFacultyId(f.tempId)}
                    className={`p-4 cursor-pointer flex justify-between items-center transition-all ${selectedFacultyId === f.tempId ? "bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"}`}
                  >
                    <div className="overflow-hidden">
                      <p className={`font-bold text-sm truncate ${selectedFacultyId === f.tempId ? "text-orange-700 dark:text-orange-400" : "dark:text-white"}`}>{f.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded font-bold uppercase">{f.department}</span>
                        <span className={`text-[9px] font-bold ${f.expertiseIds.length > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"}`}>{f.expertiseIds.length} Subjects</span>
                      </div>
                    </div>
                    <UserCheck size={16} className={selectedFacultyId === f.tempId ? "text-orange-500" : "text-gray-300 dark:text-gray-600"} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: EXPERTISE WORKSPACE */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                  <BookOpen size={20} className="text-orange-600 dark:text-orange-400" /> Teaching Expertise
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assign subjects taught by the faculty.</p>
              </div>
              {selectedFaculty && (
                <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  Load: {selectedFaculty.maxWeeklyLoad} Hrs/Wk
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 dark:bg-transparent">
              {fetchingSubjects ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-orange-600 dark:text-orange-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading Subject Catalog...</p>
                </div>
              ) : !selectedFaculty ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Filter size={48} strokeWidth={1} className="opacity-20" />
                  </div>
                  <p className="font-medium">Select a faculty member from the list</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase">Department</p>
                      <p className="text-xl font-bold dark:text-white">{selectedFaculty.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Employee ID</p>
                      <p className="font-mono text-sm dark:text-gray-300">{selectedFaculty.employeeId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subjectsInDept.length === 0 ? (
                      <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl border-gray-200 dark:border-gray-700">
                        <AlertCircle size={32} className="mx-auto text-orange-400 dark:text-orange-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No subjects found for "{selectedFaculty.department}"</p>
                      </div>
                    ) : (
                      subjectsInDept.map((sub) => {
                        const isSelected = selectedFaculty.expertiseIds.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            disabled={isLocked}
                            onClick={() => toggleSubject(sub.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                              isSelected 
                                ? "bg-orange-600 border-orange-600 text-white shadow-md" 
                                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-orange-500"
                            }`}
                          >
                            <div>
                              <p className={`font-bold text-sm ${isSelected ? "text-white" : "dark:text-white"}`}>{sub.code}</p>
                              <p className={`text-[10px] ${isSelected ? "text-orange-100" : "text-gray-500 dark:text-gray-400"} truncate max-w-[200px]`}>{sub.name}</p>
                            </div>
                            {isSelected && <CheckCircle2 size={18} />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => handleNavigate("prev")}
          className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <button
          onClick={handleFinalSave}
          disabled={facultyList.length === 0 || isSubmitting}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-800 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isSubmitting ? "Syncing Registry..." : (isLocked || facultyList.length > 0) ? "Next: Enrollment" : "Save & Finalize Registry"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FacultyManager;