import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;

export const generateTimetable = (data) => {
  return axios.post(`${BASE}/generate`, data);
};