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
        const state = get();
        
        // If we have a persisted user, trust it immediately for fast rendering
        // Then verify in background
        if (state.user) {
          set({ loading: false });
        }

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth session error:', error);
            set({ user: null, loading: false });
            return;
          }

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
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              // Defer role fetch to avoid deadlock
              setTimeout(async () => {
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
              }, 0);
            } else {
              set({ user: null, loading: false });
            }
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: "trainu-auth",
      onRehydrateStorage: () => (state) => {
        // When store rehydrates from localStorage, if user exists, set loading false
        if (state?.user) {
          state.loading = false;
        }
      },
    }
  )
);

// Fetch user role from server-side user_roles table
async function fetchUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return 'trainer';
    }

    if (!data) {
      // Create default trainer role if none exists
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'trainer' });
      
      if (insertError) {
        console.error('Error creating default role:', insertError);
      }
      return 'trainer';
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('Failed to fetch user role:', error);
    return 'trainer';
  }
}
