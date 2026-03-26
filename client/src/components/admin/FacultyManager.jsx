import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, GraduationCap, Search, 
  Trash2, ChevronLeft, ChevronRight, Check,
  AlertTriangle, BookOpen, UserCheck, Plus, X
} from 'lucide-react';
import BulkUploadZone from './BulkUploadZone';

const FacultyManager = ({ subjects = [], onNext, onPrev, isLoading }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  
  // State for manual addition
  const [showManualForm, setShowManualForm] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', department: '', maxLoad: 18 });

  // 1. Logic: Find selected faculty and calculate their current load
  const selectedFaculty = useMemo(() => 
    facultyList.find(f => f.id === selectedFacultyId), 
    [facultyList, selectedFacultyId]
  );

  const calculateLoad = (fac) => {
    if (!fac.expertiseIds || !subjects) return 0;
    // Added safety check (subjects || []) to prevent the 'filter' of undefined error
    return (subjects || [])
      .filter(s => fac.expertiseIds.includes(s.id))
      .reduce((acc, s) => acc + (Number(s.lecture || 0) + Number(s.tutorial || 0) + Number(s.practical || 0)), 0);
  };

  // 2. Logic: Toggle expertise assignment
  const toggleSubjectExpertise = (subjectId) => {
    setFacultyList(prev => prev.map(f => {
      if (f.id !== selectedFacultyId) return f;
      const expertiseIds = f.expertiseIds || [];
      return {
        ...f,
        expertiseIds: expertiseIds.includes(subjectId)
          ? expertiseIds.filter(id => id !== subjectId)
          : [...expertiseIds, subjectId]
      };
    }));
  };

  // 3. Logic: Handle Manual Addition
  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.department) return;
    
    const facultyEntry = {
      ...newFaculty,
      id: Date.now() + Math.random(),
      expertiseIds: [],
      maxLoad: Number(newFaculty.maxLoad) || 18
    };

    setFacultyList(prev => [...prev, facultyEntry]);
    setNewFaculty({ name: '', department: '', maxLoad: 18 });
    setShowManualForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FACULTY LIST */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-green-600" /> Faculty Directory
                </h3>
                <div className="flex gap-2">
                   <button 
                    onClick={() => { setShowManualForm(!showManualForm); setShowBulk(false); }}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {showManualForm ? <X size={12}/> : <Plus size={12}/>} Manual
                  </button>
                  <button 
                    onClick={() => { setShowBulk(!showBulk); setShowManualForm(false); }}
                    className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md"
                  >
                    {showBulk ? 'List View' : 'Bulk Import'}
                  </button>
                </div>
              </div>
              
              {!showManualForm && !showBulk && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    placeholder="Search by name or department..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {showBulk ? (
                <div className="p-4">
                  <BulkUploadZone type="Faculty" onUpload={(data) => {
                    setFacultyList([...facultyList, ...data.map(d => ({ ...d, id: Date.now() + Math.random(), expertiseIds: [] }))]);
                    setShowBulk(false);
                  }} />
                </div>
              ) : showManualForm ? (
                <div className="p-4 animate-in fade-in slide-in-from-top-2">
                  <form onSubmit={handleManualAdd} className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Faculty Name</label>
                      <input 
                        autoFocus
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="e.g. Dr. Robert Fox"
                        value={newFaculty.name}
                        onChange={e => setNewFaculty({...newFaculty, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Department</label>
                      <input 
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="e.g. Computer Science"
                        value={newFaculty.department}
                        onChange={e => setNewFaculty({...newFaculty, department: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Max Weekly Hours</label>
                      <input 
                        type="number"
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        value={newFaculty.maxLoad}
                        onChange={e => setNewFaculty({...newFaculty, maxLoad: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!newFaculty.name || !newFaculty.department}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      Add Faculty Member
                    </button>
                  </form>
                </div>
              ) : (
                facultyList
                  .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.department.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(fac => {
                    const load = calculateLoad(fac);
                    const isOverloaded = load > fac.maxLoad;
                    return (
                      <button
                        key={fac.id}
                        onClick={() => setSelectedFacultyId(fac.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedFacultyId === fac.id 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-1 ring-green-500' 
                          : 'bg-white dark:bg-gray-900 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sm dark:text-white">{fac.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">{fac.department}</p>
                          </div>
                          {isOverloaded && <AlertTriangle size={14} className="text-amber-500" />}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold uppercase">
                            <span className={isOverloaded ? 'text-red-500' : 'text-gray-400'}>Weekly Load</span>
                            <span className="dark:text-gray-400">{load} / {fac.maxLoad} hrs</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-500' : 'bg-green-500'}`} 
                              style={{ width: `${Math.min((load / fac.maxLoad) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })
              )}
              
              {!showBulk && !showManualForm && facultyList.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <UserPlus size={32} className="mb-2 opacity-20" />
                  <p className="text-xs italic">No faculty added yet. Use Bulk Import or Manual Add to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXPERTISE MAPPER */}
        <div className="lg:col-span-7">
          {selectedFaculty ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[600px] animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg">
                    {selectedFaculty.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">{selectedFaculty.name}</h3>
                    <p className="text-sm text-gray-500">Assign subjects this faculty is qualified to teach.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(subjects || []).map(subject => {
                    const isAssigned = (selectedFaculty.expertiseIds || []).includes(subject.id);
                    return (
                      <button
                        key={subject.id}
                        onClick={() => toggleSubjectExpertise(subject.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                          isAssigned 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                          : 'border-gray-100 dark:border-gray-800 hover:border-green-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isAssigned ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            <BookOpen size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold dark:text-white">{subject.code}</p>
                            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{subject.name}</p>
                          </div>
                        </div>
                        {isAssigned && <Check size={16} className="text-green-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-[10px] text-gray-400 italic">Expertise updates are saved automatically.</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400">
              <UserCheck size={48} strokeWidth={1} className="mb-4" />
              <p className="font-medium text-sm">Select a faculty member from the list to map expertise.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button onClick={onPrev} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 transition-all flex items-center gap-2">
          <ChevronLeft size={20} /> Back
        </button>
        <button 
          onClick={() => onNext(facultyList)} 
          disabled={facultyList.length === 0 || isLoading} 
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isLoading ? 'Finalizing Directory...' : 'Save & Next'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FacultyManager;