import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  getRecentSubmissions: async (limit = 5) => {
    const response = await api.get('/api/dashboard/recent-submissions', {
      params: { limit },
    });
    return response.data;
  },

  getProgressData: async (period = '30d') => {
    const response = await api.get('/api/dashboard/progress', {
      params: { period },
    });
    return response.data;
  },
};

// Study Plan API
export const studyPlanAPI = {
  getCurrent: async () => {
    const response = await api.get('/api/study-plans/current');
    return response.data;
  },

  generate: async (data) => {
    const response = await api.post('/api/study-plans/generate', data);
    return response.data;
  },

  updateProgress: async (planId, dayIndex, completed) => {
    const response = await api.patch(`/api/study-plans/${planId}/progress`, {
      day_index: dayIndex,
      completed,
    });
    return response.data;
  },
};

// Practice API
export const practiceAPI = {
  getTaskTypes: async () => {
    const response = await api.get('/api/practice/task-types');
    return response.data;
  },

  getTask: async (taskType, level = null) => {
    const response = await api.get('/api/practice/task', {
      params: { task_type: taskType, level },
    });
    return response.data;
  },

  submitResponse: async (data) => {
    const response = await api.post('/api/practice/submit', data);
    return response.data;
  },
};

// Submissions API
export const submissionsAPI = {
  getAll: async (page = 1, limit = 20, filters = {}) => {
    const response = await api.get('/api/submissions', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  getById: async (submissionId) => {
    const response = await api.get(`/api/submissions/${submissionId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/submissions/stats');
    return response.data;
  },
};

// Subscription API
export const subscriptionAPI = {
  getCurrent: async () => {
    const response = await api.get('/api/subscription/current');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/subscription/history');
    return response.data;
  },

  cancel: async () => {
    const response = await api.post('/api/subscription/cancel');
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createPayment: async (data) => {
    const response = await api.post('/api/payments/create', data);
    return response.data;
  },

  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/api/payments/${paymentId}/status`);
    return response.data;
  },
};

export default api;
