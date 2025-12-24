// src/stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface UserState {
  user: User | null;
  onlineUsers: string[]; // ✅ Added to track usernames
  setUser: (user: User) => void;
  setOnlineUsers: (users: string[]) => void; // ✅ Added setter
  clearUser: () => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      onlineUsers: [], // ✅ Initialize as empty
      setUser: (user) => set({ user }),
      setOnlineUsers: (users) => set({ onlineUsers: users }), // ✅ Set the list
      clearUser: () => set({ user: null, onlineUsers: [] }),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'user-storage',
      // ✅ Don't persist onlineUsers; it should be fresh per session
      partialize: (state) => ({ user: state.user }), 
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);