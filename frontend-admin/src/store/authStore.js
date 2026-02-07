import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      adminKey: null,
      isAuthenticated: false,

      setAdminKey: (key) => {
        localStorage.setItem('admin_key', key);
        set({ adminKey: key, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('admin_key');
        set({ adminKey: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-auth',
    }
  )
);

export default useAuthStore;
