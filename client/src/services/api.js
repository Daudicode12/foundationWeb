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
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const email = userData.email;
    const userName = userData.userName;
    const response = await api.post('/api/events/rsvp', { eventId, email, userName });
    return response.data;
  },
  
  cancelRsvp: async (eventId) => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const email = userData.email;
    const response = await api.delete('/api/events/rsvp', { data: { eventId, email } });
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

// Admin RSVPs Services
export const adminRsvpsService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/rsvps');
    return response.data;
  },
};

// Admin Announcements Services
export const adminAnnouncementsService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/announcements');
    return response.data;
  },
  
  create: async (announcementData) => {
    const response = await adminApi.post('/api/admin/announcements', announcementData);
    return response.data;
  },
  
  update: async (announcementId, announcementData) => {
    const response = await adminApi.put(`/api/admin/announcements/${announcementId}`, announcementData);
    return response.data;
  },
  
  delete: async (announcementId) => {
    const response = await adminApi.delete(`/api/admin/announcements/${announcementId}`);
    return response.data;
  },
};

// Admin Sermons Services
export const adminSermonsService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/sermons');
    return response.data;
  },
  
  getUpcoming: async () => {
    const response = await adminApi.get('/api/admin/sermons/upcoming');
    return response.data;
  },
  
  create: async (sermonData) => {
    const response = await adminApi.post('/api/admin/sermons', sermonData);
    return response.data;
  },
  
  update: async (sermonId, sermonData) => {
    const response = await adminApi.put(`/api/admin/sermons/${sermonId}`, sermonData);
    return response.data;
  },
  
  delete: async (sermonId) => {
    const response = await adminApi.delete(`/api/admin/sermons/${sermonId}`);
    return response.data;
  },
};

// Public Sermons Services (for members)
export const sermonsService = {
  getAll: async () => {
    const response = await api.get('/api/sermons');
    return response.data;
  },
  
  getUpcoming: async () => {
    const response = await api.get('/api/sermons/upcoming');
    return response.data;
  },
  
  getById: async (sermonId) => {
    const response = await api.get(`/api/sermons/${sermonId}`);
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
