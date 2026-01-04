import axios from 'axios';

// Use empty string for baseURL - the proxy in package.json will handle API calls
const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate instance for admin API calls
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add member token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('memberToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add admin token to admin API requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/login', { email, password });
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await api.post('/api/signup', userData);
    return response.data;
  },
  
  verifyToken: async (token) => {
    const response = await api.post('/api/verify-token', { token });
    return response.data;
  },
  
  refreshToken: async (token) => {
    const response = await api.post('/api/refresh-token', { token });
    return response.data;
  },
};

// Admin Auth Services
export const adminAuthService = {
  login: async (email, password) => {
    const response = await api.post('/api/admin/login', { email, password });
    return response.data;
  },
  
  verifyToken: async (token) => {
    const response = await api.post('/api/admin/verify', { token });
    return response.data;
  },
};

// Events Services
export const eventsService = {
  getAll: async () => {
    const response = await api.get('/api/events');
    return response.data;
  },
  
  getUpcoming: async () => {
    const response = await api.get('/api/events/upcoming');
    return response.data;
  },
  
  rsvp: async (eventId) => {
    const token = localStorage.getItem('memberToken');
    const response = await api.post('/api/events/rsvp', { eventId, token });
    return response.data;
  },
  
  cancelRsvp: async (eventId) => {
    const token = localStorage.getItem('memberToken');
    const response = await api.post('/api/events/cancel-rsvp', { eventId, token });
    return response.data;
  },
};

// Admin Events Services
export const adminEventsService = {
  create: async (eventData) => {
    const response = await adminApi.post('/api/admin/events', eventData);
    return response.data;
  },
  
  update: async (eventId, eventData) => {
    const response = await adminApi.put(`/api/admin/events/${eventId}`, eventData);
    return response.data;
  },
  
  delete: async (eventId) => {
    const response = await adminApi.delete(`/api/admin/events/${eventId}`);
    return response.data;
  },
  
  getRsvps: async (eventId) => {
    const response = await adminApi.get(`/api/admin/events/${eventId}/rsvps`);
    return response.data;
  },
};

// Admin Members Services
export const adminMembersService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/members');
    return response.data;
  },
  
  getStats: async () => {
    const response = await adminApi.get('/api/admin/stats');
    return response.data;
  },
};

// Contact Services
export const contactService = {
  sendMessage: async (contactData) => {
    const response = await api.post('/api/contact', contactData);
    return response.data;
  },
};

export default api;
