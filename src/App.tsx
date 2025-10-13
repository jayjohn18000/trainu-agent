import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
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
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout><Outlet /></AppLayout>}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/dashboard/client" element={<ClientDashboard />} />
            <Route path="/me" element={<ClientDashboard />} />
            <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
            <Route path="/dashboard/owner" element={<OwnerDashboard />} />
            <Route path="/dashboard/gym-admin" element={<GymAdminDashboard />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/trainers/:slug" element={<TrainerProfile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/clients" element={<Clients />} />
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/trainers" element={<Admin />} />
            <Route path="/admin/classes" element={<Admin />} />
            <Route path="/dev/flags" element={<DevFlags />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
