import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const generateTimetable = async (data) => {
  const response = await axios.post(
    `${API_URL}/generate`,
    data
  );
  return response.data;
};