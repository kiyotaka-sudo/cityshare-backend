// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Remplacez par votre IP locale (ex: 192.168.1.10)
// Lancez `ipconfig` sur Windows pour trouver votre IPv4
export const BASE_URL = 'http://192.168.1.100:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : ajoute le token JWT automatiquement
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur réponse
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── TRIPS ───────────────────────────────────────────────────────────────────
export const tripsAPI = {
  getAvailable: () => api.get('/trips/available'),
  search: (params: any) => api.get('/trips/search', { params }),
  getById: (id: number) => api.get(`/trips/${id}`),
  getMyTrips: () => api.get('/trips/my'),
  create: (data: any) => api.post('/trips', data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/trips/${id}/status`, null, { params: { status } }),
};

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data: any) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getTripBookings: (tripId: number) => api.get(`/bookings/trip/${tripId}`),
  cancel: (id: number) => api.patch(`/bookings/${id}/cancel`),
  rate: (data: any) => api.post('/bookings/rate', data),
};

// ─── PACKAGES ────────────────────────────────────────────────────────────────
export const packagesAPI = {
  send: (data: any) => api.post('/packages', data),
  getMyPackages: () => api.get('/packages/my'),
  track: (code: string) => api.get(`/packages/track/${code}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/packages/${id}/status`, null, { params: { status } }),
  getTripPackages: (tripId: number) => api.get(`/packages/trip/${tripId}`),
};

export default api;
