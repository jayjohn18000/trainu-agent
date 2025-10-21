import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AgentLayout } from "@/components/AgentLayout";
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
import ClientsAgent from "@/pages/ClientsAgent";
import SettingsAgent from "@/pages/SettingsAgent";
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

          {/* Agent Console routes - new layout */}
          <Route element={<AgentLayout><Outlet /></AgentLayout>}>
            <Route path="/today" element={<Today />} />
            <Route path="/clients" element={<ClientsAgent />} />
            <Route path="/settings" element={<SettingsAgent />} />
          </Route>

          {/* Legacy routes - old layout (will be phased out) */}
          <Route element={<AppLayout><Outlet /></AppLayout>}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/dashboard/client" element={<ClientDashboardNew />} />
            <Route path="/me" element={<ClientDashboardNew />} />
            <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
            <Route path="/dashboard/owner" element={<OwnerDashboard />} />
            <Route path="/dashboard/gym-admin" element={<GymAdminDashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/dashboard/clients" element={<TrainerClients />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/community" element={<Community />} />
            <Route path="/events" element={<Events />} />
            <Route path="/community/events" element={<CommunityEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/community/people" element={<CommunityPeople />} />
            <Route path="/community/groups" element={<CommunityGroups />} />
            <Route path="/store" element={<Store />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/growth" element={<Growth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/trainers" element={<Admin />} />
            <Route path="/admin/classes" element={<Admin />} />
            <Route path="/dev/flags" element={<DevFlags />} />
          </Route>

          {/* Error routes */}
          <Route path="/410" element={<Gone410 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
