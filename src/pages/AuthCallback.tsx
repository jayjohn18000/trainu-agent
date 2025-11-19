import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');

        // Immediately clear URL to prevent token exposure in browser history
        window.history.replaceState({}, document.title, window.location.pathname);

        if (!accessToken) {
          throw new Error('No access token provided');
        }

        // Set session using the token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '', // Magic link doesn't provide refresh token initially
        });

        if (error) throw error;

        // Initialize auth store
        await initialize();

        // Redirect to main app
        navigate('/today', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, initialize]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
