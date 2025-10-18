import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const timetableAPI = {
  // Health check
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Check Python service
  checkPythonService: async () => {
    const response = await api.get('/check-python');
    return response.data;
  },

  // Generate timetable
  generateTimetable: async (data) => {
    const response = await api.post('/generate-timetable', data);
    return response.data;
  },

  // Get already generated timetable
   getTimetable: async () => {
    const response = await fetch('http://localhost:5000/get-timetable');
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return response.json();
  },

  // Validate data
  validateData: async (data) => {
    const response = await api.post('/validate-data', data);
    return response.data;
  },
};


export default api;