import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedLayout } from "@/components/layouts/UnifiedLayout";
import { RedirectHandler } from "@/components/RedirectHandler";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import Landing from "@/pages/Landing";
import Discover from "@/pages/Discover";
import Directory from "@/pages/Directory";
import TrainerProfile from "@/pages/TrainerProfile";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientDashboardNew from "@/pages/ClientDashboardNew";
import TrainerDashboard from "@/pages/TrainerDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import GymAdminDashboard from "@/pages/GymAdminDashboard";
import Calendar from "@/pages/Calendar";
import Progress from "@/pages/Progress";
import Programs from "@/pages/Programs";
import WorkoutLogger from "@/pages/WorkoutLogger";
import Clients from "@/pages/Clients";
import TrainerClients from "@/pages/TrainerClients";
import Messages from "@/pages/Messages";
import Community from "@/pages/Community";
import Events from "@/pages/Events";
import CommunityEvents from "@/pages/community/Events";
import EventDetail from "@/pages/EventDetail";
import CommunityPeople from "@/pages/community/People";
import CommunityGroups from "@/pages/community/Groups";
import Store from "@/pages/Store";
import Creators from "@/pages/Creators";
import Inbox from "@/pages/Inbox";
import Growth from "@/pages/Growth";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import DevFlags from "@/pages/DevFlags";
import Challenges from "@/pages/Challenges";
import NotFound from "@/pages/NotFound";
import Today from "@/pages/Today";
import Queue from "@/pages/Queue";
import Gone410 from "@/pages/Gone410";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RedirectHandler />
        <Routes>
          {/* Marketing routes - no app chrome */}
          <Route path="/" element={<Landing />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/trainers/:slug" element={<TrainerProfile />} />

          {/* Trainer routes - unified sidebar layout */}
          <Route element={<UnifiedLayout />}>
            <Route path="/today" element={<Today />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/growth" element={<Growth />} />
          </Route>

          {/* Client routes - tab-based layout */}
          <Route element={<AppLayout><Outlet /></AppLayout>}>
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
            <Route path="/discover" element={<Discover />} />
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
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
