import api from "../services/api"; // axios instance

const dataService = {
  // 🔹 STEP 1: Institution
  saveInstitutionConfig: async (data) => {
    return await api.post("/data/institution", data);
  },

  // 🔹 GET PROGRESS (CRITICAL)
  getProgress: async () => {
    return await api.get("/data/progress");
  },

  // 🔹 STEP 2: Rooms
  saveRooms: async (rooms) => {
    return await api.post("/data/rooms", {
      rooms, // backend expects { rooms: [...] }
    });
  },

  getCoreSubjects: async (courseId, semester) => {
    return await api.get(
      `/data/core-subjects?courseId=${courseId}&semester=${semester}`,
    );
  },

  getElectives: async () => {
    return await api.get("/data/electives");
  },

  // 🔹 FUTURE (placeholders for consistency)

  saveSubjects: async (subjects) => {
    return await api.post("/data/subjects", { subjects });
  },

  saveFaculty: async (faculty) => {
    return await api.post("/data/faculty", { faculty });
  },

  getSubjectsForFaculty: async () => {
    return await api.get("/data/subjects-faculty");
  },

  saveEnrollment: async (enrollment) => {
    return await api.post("/data/enrollment", { enrollment });
  },

  getEnrollment: async () => {
    return await api.get("/data/enrollment");
  },

  getInstitution: async () => {
    return await api.get("/data/institution");
  },

  getRooms: async () => {
    return await api.get("/data/rooms");
  },

  getSubjects: async () => {
    return await api.get("/data/subjects");
  },

  getFaculty: async () => {
    return await api.get("/data/faculty");
  },
};

export default dataService;
