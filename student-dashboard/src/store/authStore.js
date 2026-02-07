import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state from localStorage
  initialize: async () => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({ user, isAuthenticated: true, isLoading: false });

        // Verify token is still valid by fetching current user
        const currentUser = await authAPI.getCurrentUser();
        set({ user: currentUser });
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        // Token is invalid, clear auth state
        get().logout();
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authAPI.login(email, password);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao fazer login';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Register
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao criar conta';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Update user profile
  updateUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authAPI.updateProfile(data);

      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao atualizar perfil';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if user has active subscription
  hasActiveSubscription: () => {
    const { user } = get();
    if (!user) return false;

    const activeStatuses = ['active', 'trial'];
    return activeStatuses.includes(user.subscription_status);
  },

  // Check if subscription is trial
  isTrialSubscription: () => {
    const { user } = get();
    return user?.subscription_status === 'trial';
  },

  // Get subscription end date
  getSubscriptionEndDate: () => {
    const { user } = get();
    return user?.subscription_end_date;
  },
}));

export default useAuthStore;
