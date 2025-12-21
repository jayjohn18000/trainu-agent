import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedLayout } from "@/components/layouts/UnifiedLayout";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { RedirectHandler } from "@/components/RedirectHandler";
import { ModalRouteHandler } from "@/components/navigation/ModalRouteHandler";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

// Critical routes - loaded immediately for best UX
import Login from "@/pages/Login";
import Today from "@/pages/Today";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

const AuthCallback = lazyWithRetry(() => import("@/pages/AuthCallback"));

// Lazy load secondary routes for better performance with retry logic
import { lazyWithRetry } from "@/lib/lazy";

// Landing pages
const SmartLanding = lazyWithRetry(() => import("@/pages/SmartLanding"));
const LandingHome = lazyWithRetry(() => import("@/pages/landing/Home"));
const Product = lazyWithRetry(() => import("@/pages/landing/Product"));
const Pricing = lazyWithRetry(() => import("@/pages/landing/Pricing"));
const HowItWorks = lazyWithRetry(() => import("@/pages/landing/HowItWorks"));
const Resources = lazyWithRetry(() => import("@/pages/landing/Resources"));
const About = lazyWithRetry(() => import("@/pages/landing/About"));
const Contact = lazyWithRetry(() => import("@/pages/landing/Contact"));
const Challenge = lazyWithRetry(() => import("@/pages/landing/Challenge"));
const ThankYou = lazyWithRetry(() => import("@/pages/landing/ThankYou"));
const ChallengeRating = lazyWithRetry(() => import("@/pages/ChallengeRating"));
const Onboarding = lazyWithRetry(() => import("@/pages/Onboarding"));

const Directory = lazyWithRetry(() => import("@/pages/Directory"));
const TrainerProfile = lazyWithRetry(() => import("@/pages/TrainerProfile"));
const Queue = lazyWithRetry(() => import("@/pages/Queue"));
const Clients = lazyWithRetry(() => import("@/pages/Clients"));
const Growth = lazyWithRetry(() => import("@/pages/Growth"));
const SettingsAgent = lazyWithRetry(() => import("@/pages/SettingsAgent"));
const Integrations = lazyWithRetry(() => import("@/pages/Integrations"));
const ClientDashboard = lazyWithRetry(() => import("@/pages/ClientDashboard"));
const ClientDashboardNew = lazyWithRetry(() => import("@/pages/ClientDashboardNew"));
const WorkoutLogger = lazyWithRetry(() => import("@/pages/WorkoutLogger"));
const Progress = lazyWithRetry(() => import("@/pages/Progress"));
const Challenges = lazyWithRetry(() => import("@/pages/Challenges"));
const Programs = lazyWithRetry(() => import("@/pages/Programs"));
const Community = lazyWithRetry(() => import("@/pages/Community"));
const Events = lazyWithRetry(() => import("@/pages/Events"));
const CommunityEvents = lazyWithRetry(() => import("@/pages/community/Events"));
const EventDetail = lazyWithRetry(() => import("@/pages/EventDetail"));
const CommunityPeople = lazyWithRetry(() => import("@/pages/community/People"));
const CommunityGroups = lazyWithRetry(() => import("@/pages/community/Groups"));
const Store = lazyWithRetry(() => import("@/pages/Store"));
const Creators = lazyWithRetry(() => import("@/pages/Creators"));
const Admin = lazyWithRetry(() => import("@/pages/Admin"));
const AdminVerifications = lazyWithRetry(() => import("@/pages/AdminVerifications"));
const DevFlags = lazyWithRetry(() => import("@/pages/DevFlags"));
const Gone410 = lazyWithRetry(() => import("@/pages/Gone410"));
const NotFound = lazyWithRetry(() => import("@/pages/NotFound"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Protected route wrapper - optimized for instant loading with persisted auth
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  // If we have a persisted user, render immediately (auth validates in background)
  if (user) return <>{children}</>;
  
  // Only show loading on first-time auth check (no persisted user)
  if (loading) return <LoadingFallback />;
  
  return <Navigate to="/login" replace />;
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
            {/* Public landing pages */}
            <Route path="/" element={<SmartLanding />} />
            <Route path="/product" element={<Product />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/challenge/rate" element={<ChallengeRating />} />
            
            {/* Public app routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/trainers/:slug" element={<TrainerProfile />} />

            {/* Protected trainer routes - unified sidebar layout */}
            <Route element={<ProtectedRoute><UnifiedLayout /></ProtectedRoute>}>
              <Route path="/today" element={<Today />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/growth" element={<Growth />} />
              <Route path="/settings-agent" element={<SettingsAgent />} />
              {/* Modal route handler for legacy routes */}
              <Route path="/messages" element={<ModalRouteHandler />} />
              <Route path="/calendar" element={<ModalRouteHandler />} />
              <Route path="/settings" element={<ModalRouteHandler />} />
            </Route>

            {/* Protected client routes - tab-based layout */}
            <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
              <Route path="/me" element={<ClientDashboardNew />} />
              <Route path="/workout" element={<WorkoutLogger />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/challenges" element={<Challenges />} />
              {/* Legacy routes hidden for demo */}
              {/* <Route path="/community" element={<Community />} /> */}
              {/* <Route path="/events" element={<Events />} /> */}
              {/* <Route path="/community/events" element={<CommunityEvents />} /> */}
              {/* <Route path="/events/:id" element={<EventDetail />} /> */}
              {/* <Route path="/community/people" element={<CommunityPeople />} /> */}
              {/* <Route path="/community/groups" element={<CommunityGroups />} /> */}
              {/* <Route path="/store" element={<Store />} /> */}
            </Route>

            {/* Admin & Discovery routes - tab-based layout */}
            <Route element={<AppLayout><Outlet /></AppLayout>}>
              <Route path="/discover" element={<Creators />} />
              <Route path="/creators" element={<Creators />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/trainers" element={<Admin />} />
              <Route path="/admin/classes" element={<Admin />} />
              <Route path="/admin/verifications" element={<AdminVerifications />} />
              <Route path="/dev/flags" element={<DevFlags />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/dashboard/trainer" element={<Navigate to="/today" replace />} />
            <Route path="/dashboard/client" element={<Navigate to="/me" replace />} />
            <Route path="/dashboard/clients" element={<Navigate to="/clients" replace />} />
            <Route path="/inbox" element={<Navigate to="/today" replace />} />
            {/* /calendar, /messages, /settings now handled by ModalRouteHandler */}

            {/* Error routes */}
            <Route path="/410" element={<Gone410 />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </BrowserRouter>
    </ErrorBoundary>
  );
}
