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

// Prayer Request Services (for members)
export const prayerRequestService = {
  submit: async (prayerData) => {
    const response = await api.post('/api/prayer-requests', prayerData);
    return response.data;
  },
  
  getMyRequests: async (email) => {
    const response = await api.get(`/api/prayer-requests?email=${encodeURIComponent(email)}`);
    return response.data;
  },
};

// Member Offerings Services (view own offerings)
export const myOfferingsService = {
  getMyOfferings: async (email) => {
    const response = await api.get(`/api/my-offerings?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  
  getMyOfferingsByPhone: async (phone) => {
    const response = await api.get(`/api/my-offerings/by-phone?phone=${encodeURIComponent(phone)}`);
    return response.data;
  },
  
  getMyTotal: async (email) => {
    const response = await api.get(`/api/my-offerings/total?email=${encodeURIComponent(email)}`);
    return response.data;
  },
  
  getMySummary: async (email) => {
    const response = await api.get(`/api/my-offerings/summary?email=${encodeURIComponent(email)}`);
    return response.data;
  },
};

// Admin Contact Services
export const adminContactService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/contacts');
    return response.data;
  },
  
  getById: async (contactId) => {
    const response = await adminApi.get(`/api/admin/contacts/${contactId}`);
    return response.data;
  },
  
  markAsRead: async (contactId) => {
    const response = await adminApi.put(`/api/admin/contacts/${contactId}/read`);
    return response.data;
  },
  
  delete: async (contactId) => {
    const response = await adminApi.delete(`/api/admin/contacts/${contactId}`);
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await adminApi.get('/api/admin/contacts/count');
    return response.data;
  },
};

// Admin Prayer Request Services
export const adminPrayerRequestService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/prayer-requests');
    return response.data;
  },
  
  getById: async (prayerId) => {
    const response = await adminApi.get(`/api/admin/prayer-requests/${prayerId}`);
    return response.data;
  },
  
  markAsRead: async (prayerId) => {
    const response = await adminApi.put(`/api/admin/prayer-requests/${prayerId}/read`);
    return response.data;
  },
  
  updateStatus: async (prayerId, status) => {
    const response = await adminApi.put(`/api/admin/prayer-requests/${prayerId}/status`, { status });
    return response.data;
  },
  
  delete: async (prayerId) => {
    const response = await adminApi.delete(`/api/admin/prayer-requests/${prayerId}`);
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await adminApi.get('/api/admin/prayer-requests/count');
    return response.data;
  },
};

// Admin Offerings Services
export const adminOfferingsService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/offerings');
    return response.data;
  },
  
  getById: async (offeringId) => {
    const response = await adminApi.get(`/api/admin/offerings/${offeringId}`);
    return response.data;
  },
  
  create: async (offeringData) => {
    const response = await adminApi.post('/api/admin/offerings', offeringData);
    return response.data;
  },
  
  update: async (offeringId, offeringData) => {
    const response = await adminApi.put(`/api/admin/offerings/${offeringId}`, offeringData);
    return response.data;
  },
  
  delete: async (offeringId) => {
    const response = await adminApi.delete(`/api/admin/offerings/${offeringId}`);
    return response.data;
  },
  
  getCount: async () => {
    const response = await adminApi.get('/api/admin/offerings/count');
    return response.data;
  },
  
  getTotal: async () => {
    const response = await adminApi.get('/api/admin/offerings/total');
    return response.data;
  },
  
  getSummary: async () => {
    const response = await adminApi.get('/api/admin/offerings/summary');
    return response.data;
  },
  
  getByDateRange: async (startDate, endDate) => {
    const response = await adminApi.get(`/api/admin/offerings/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  getMonthlyReport: async (year, month) => {
    const response = await adminApi.get(`/api/admin/offerings/report/${year}/${month}`);
    return response.data;
  },
};

// Resource Services (for members - public)
export const resourceService = {
  getAll: async (category = null, featured = null) => {
    let url = '/api/resources';
    const params = [];
    if (category) params.push(`category=${category}`);
    if (featured) params.push(`featured=${featured}`);
    if (params.length > 0) url += '?' + params.join('&');
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (resourceId) => {
    const response = await api.get(`/api/resources/${resourceId}`);
    return response.data;
  },
  
  getFeatured: async () => {
    const response = await api.get('/api/resources?featured=true');
    return response.data;
  },
};

// Admin Resource Services
export const adminResourceService = {
  getAll: async () => {
    const response = await adminApi.get('/api/admin/resources');
    return response.data;
  },
  
  getById: async (resourceId) => {
    const response = await adminApi.get(`/api/admin/resources/${resourceId}`);
    return response.data;
  },
  
  create: async (resourceData) => {
    const response = await adminApi.post('/api/admin/resources', resourceData);
    return response.data;
  },
  
  update: async (resourceId, resourceData) => {
    const response = await adminApi.put(`/api/admin/resources/${resourceId}`, resourceData);
    return response.data;
  },
  
  delete: async (resourceId) => {
    const response = await adminApi.delete(`/api/admin/resources/${resourceId}`);
    return response.data;
  },
  
  getCount: async () => {
    const response = await adminApi.get('/api/admin/resources/count');
    return response.data;
  },
  
  toggleFeatured: async (resourceId) => {
    const response = await adminApi.put(`/api/admin/resources/${resourceId}/toggle-featured`);
    return response.data;
  },
};

export default api;
