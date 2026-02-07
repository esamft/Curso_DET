import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API key from localStorage
const getAdminKey = () => localStorage.getItem('admin_key') || '';

// ==================== Admin Stats ====================

export const getAdminStats = async () => {
  const response = await api.get('/api/admin/stats', {
    params: { admin_key: getAdminKey() }
  });
  return response.data;
};

// ==================== Users ====================

export const getUsers = async (params = {}) => {
  const response = await api.get('/api/admin/users', {
    params: { ...params, admin_key: getAdminKey() }
  });
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(`/api/admin/users/${userId}`, {
    params: { admin_key: getAdminKey() }
  });
  return response.data;
};

export const updateUser = async (userId, updates) => {
  const response = await api.patch(`/api/admin/users/${userId}`, updates, {
    params: { admin_key: getAdminKey() }
  });
  return response.data;
};

export const grantUserAccess = async (userId, planData) => {
  const response = await api.post(
    `/api/admin/users/${userId}/grant-access`,
    planData,
    { params: { admin_key: getAdminKey() } }
  );
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.post(
    `/api/admin/users/${userId}/deactivate`,
    {},
    { params: { admin_key: getAdminKey() } }
  );
  return response.data;
};

export const activateUser = async (userId) => {
  const response = await api.post(
    `/api/admin/users/${userId}/activate`,
    {},
    { params: { admin_key: getAdminKey() } }
  );
  return response.data;
};

// ==================== System ====================

export const expireSubscriptions = async () => {
  const response = await api.post(
    '/api/admin/system/expire-subscriptions',
    {},
    { params: { admin_key: getAdminKey() } }
  );
  return response.data;
};

// ==================== Auth ====================

export const verifyAdminKey = async (adminKey) => {
  try {
    const response = await api.get('/api/admin/stats', {
      params: { admin_key: adminKey }
    });
    return { valid: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 403) {
      return { valid: false, error: 'Chave de administrador inválida' };
    }
    return { valid: false, error: 'Erro ao conectar com o servidor' };
  }
};

// ==================== Error Handler ====================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Admin key invalid
      localStorage.removeItem('admin_key');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
