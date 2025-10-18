// client/src/api/authService.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

export const register = (payload) => api.post('/api/auth/register', payload);
export const verifyOtp = (payload) => api.post('/api/auth/verify-otp', payload);
export const login = (payload) => api.post('/api/auth/login', payload);

export default api;
