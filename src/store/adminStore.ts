import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  isSetUp,
  setupPassword,
  verifyPassword,
  changePassword as changePasswordUtil,
  startSession,
  isSessionValid,
  endSession,
  updateLastLogin,
} from '@/utils/adminAuth';

interface AdminState {
  isAuthenticated: boolean;
  isSetup: boolean;

  checkSetup: () => void;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  setup: (password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => boolean;
  changePassword: (current: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isSetup: false,

      checkSetup: () => {
        set({ isSetup: isSetUp() });
      },

      login: async (password: string) => {
        const valid = await verifyPassword(password);
        if (!valid) return { success: false, error: 'Incorrect password' };
        startSession();
        updateLastLogin();
        set({ isAuthenticated: true });
        return { success: true };
      },

      setup: async (password: string) => {
        await setupPassword(password);
        startSession();
        updateLastLogin();
        set({ isAuthenticated: true, isSetup: true });
      },

      logout: () => {
        endSession();
        set({ isAuthenticated: false });
      },

      checkSession: () => {
        if (!isSessionValid()) {
          endSession();
          set({ isAuthenticated: false });
          return false;
        }
        set({ isAuthenticated: true });
        return true;
      },

      changePassword: async (current: string, newPassword: string) => {
        return changePasswordUtil(current, newPassword);
      },
    }),
    {
      name: 'exponentia-admin-store',
      partialize: (state) => ({ isSetup: state.isSetup }),
    }
  )
);
