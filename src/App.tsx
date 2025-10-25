import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedLayout } from "@/components/layouts/UnifiedLayout";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { RedirectHandler } from "@/components/RedirectHandler";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

// Critical routes - loaded immediately for best UX
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Today from "@/pages/Today";

// Lazy load secondary routes for better performance
const Directory = lazy(() => import("@/pages/Directory"));
const TrainerProfile = lazy(() => import("@/pages/TrainerProfile"));
const Queue = lazy(() => import("@/pages/Queue"));
const Clients = lazy(() => import("@/pages/Clients"));
const Growth = lazy(() => import("@/pages/Growth"));
const ClientDashboard = lazy(() => import("@/pages/ClientDashboard"));
const ClientDashboardNew = lazy(() => import("@/pages/ClientDashboardNew"));
const WorkoutLogger = lazy(() => import("@/pages/WorkoutLogger"));
const Progress = lazy(() => import("@/pages/Progress"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const Programs = lazy(() => import("@/pages/Programs"));
const Community = lazy(() => import("@/pages/Community"));
const Events = lazy(() => import("@/pages/Events"));
const CommunityEvents = lazy(() => import("@/pages/community/Events"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const CommunityPeople = lazy(() => import("@/pages/community/People"));
const CommunityGroups = lazy(() => import("@/pages/community/Groups"));
const Store = lazy(() => import("@/pages/Store"));
const Creators = lazy(() => import("@/pages/Creators"));
const Admin = lazy(() => import("@/pages/Admin"));
const DevFlags = lazy(() => import("@/pages/DevFlags"));
const Gone410 = lazy(() => import("@/pages/Gone410"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RedirectHandler />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/trainers/:slug" element={<TrainerProfile />} />

            {/* Protected trainer routes - unified sidebar layout */}
            <Route element={<ProtectedRoute><UnifiedLayout /></ProtectedRoute>}>
              <Route path="/today" element={<Today />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/growth" element={<Growth />} />
            </Route>

            {/* Protected client routes - tab-based layout */}
            <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
              <Route path="/me" element={<ClientDashboardNew />} />
              <Route path="/workout" element={<WorkoutLogger />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/community" element={<Community />} />
              <Route path="/events" element={<Events />} />
              <Route path="/community/events" element={<CommunityEvents />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/community/people" element={<CommunityPeople />} />
              <Route path="/community/groups" element={<CommunityGroups />} />
              <Route path="/store" element={<Store />} />
            </Route>

            {/* Admin & Discovery routes - tab-based layout */}
            <Route element={<AppLayout><Outlet /></AppLayout>}>
              <Route path="/discover" element={<Creators />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/trainers" element={<Admin />} />
              <Route path="/admin/classes" element={<Admin />} />
              <Route path="/dev/flags" element={<DevFlags />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/dashboard/trainer" element={<Navigate to="/today" replace />} />
            <Route path="/dashboard/client" element={<Navigate to="/me" replace />} />
            <Route path="/dashboard/clients" element={<Navigate to="/clients" replace />} />
            <Route path="/inbox" element={<Navigate to="/today" replace />} />
            <Route path="/calendar" element={<Navigate to="/today" replace />} />
            <Route path="/messages" element={<Navigate to="/today" replace />} />
            <Route path="/settings" element={<Navigate to="/today" replace />} />

            {/* Error routes */}
            <Route path="/410" element={<Gone410 />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
