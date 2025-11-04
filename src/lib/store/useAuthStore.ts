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
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user, loading: false }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },
      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user role from server
          const role = await fetchUserRole(session.user.id);
          set({
            user: {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role,
              avatarUrl: session.user.user_metadata?.avatar_url,
            },
            loading: false,
          });
        } else {
          set({ user: null, loading: false });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            // Fetch user role from server
            const role = await fetchUserRole(session.user.id);
            set({
              user: {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role,
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

// Fetch user role from server-side user_roles table
async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Default to trainer if no role assigned yet
    return 'trainer';
  }

  return data.role as UserRole;
}
