import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const timetableService = {
  // Triggers the AI Solver
  generate: async (courseId, semester) => {
    try {
      const response = await axios.post(`${API_URL}/timetable/generate`, { courseId, semester });
      return response.data; // Should return { success: true, data: [...] }
    } catch (error) {
      throw error.response?.data || { message: "Server connection failed" };
    }
  },

  // Check if services are up (For your health-check lights)
  checkHealth: async () => {
    return await axios.get(`${API_URL}/health`);
  }
};