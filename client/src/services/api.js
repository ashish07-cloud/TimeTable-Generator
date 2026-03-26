import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// 🔥 AXIOS INSTANCE
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});


// 🔹 REQUEST INTERCEPTOR (ADD TOKEN)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => Promise.reject(error)
);


// 🔹 RESPONSE INTERCEPTOR (HANDLE 401 PROPERLY)
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.status} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    // 🔥 HANDLE UNAUTHORIZED
    if (error.response?.status === 401) {
      console.warn("Unauthorized → clearing token");

      localStorage.removeItem("token");

      // Optional: redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


// 🔹 TIMETABLE API (unchanged but cleaned)
export const timetableAPI = {
  checkHealth: async () => {
    const res = await api.get("/health");
    return res.data;
  },

  checkPythonService: async () => {
    const res = await api.get("/check-python");
    return res.data;
  },

  generateTimetable: async (data) => {
    const res = await api.post("/generate-timetable", data);
    return res.data;
  },

  getTimetable: async () => {
    const res = await api.get("/timetable");
    return res.data;
  },

  validateData: async (data) => {
    const res = await api.post("/validate-data", data);
    return res.data;
  },
};

export default api;