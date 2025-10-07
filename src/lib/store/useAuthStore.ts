import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/config/app";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: "demo-user",
        name: "Demo User",
        email: "demo@trainu.app",
        role: "client",
        avatarUrl: "https://i.pravatar.cc/150?img=12",
      },
      setUser: (user) => set({ user }),
      setRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
      logout: () => set({ user: null }),
    }),
    {
      name: "trainu-auth",
    }
  )
);
