import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store/useAuthStore";
import LandingHome from "@/pages/landing/Home";
import { Loader2 } from "lucide-react";

export default function SmartLanding() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    // Ensure auth is initialized
    initialize();
  }, [initialize]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Checking authentication">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Redirect authenticated users to the app
  if (user) {
    return <Navigate to="/today" replace />;
  }

  // Show marketing page for unauthenticated users
  return <LandingHome />;
}
