// services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  if (res.data.token) {
    localStorage.setItem('auth_token', res.data.token);
    await setFacilityId(res.data.user.facility_id);
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem('auth_token');
  // Also clear IndexedDB? Keep local data but mark for re-sync
}