import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/config/app";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isMember?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user, loading: false }),
      setRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: 'trainer',
              avatarUrl: session.user.user_metadata?.avatar_url,
            },
            loading: false,
          });
        } else {
          set({ user: null, loading: false });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'trainer',
                avatarUrl: session.user.user_metadata?.avatar_url,
              },
              loading: false,
            });
          } else {
            set({ user: null, loading: false });
          }
        });
      },
    }),
    {
      name: "trainu-auth",
    }
  )
);
