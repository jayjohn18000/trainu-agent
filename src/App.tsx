import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import Landing from "@/pages/Landing";
import Discover from "@/pages/Discover";
import Directory from "@/pages/Directory";
import TrainerProfile from "@/pages/TrainerProfile";
import ClientDashboard from "@/pages/ClientDashboard";
import TrainerDashboard from "@/pages/TrainerDashboard";
import GymAdminDashboard from "@/pages/GymAdminDashboard";
import Calendar from "@/pages/Calendar";
import Progress from "@/pages/Progress";
import Programs from "@/pages/Programs";
import WorkoutLogger from "@/pages/WorkoutLogger";
import Clients from "@/pages/Clients";
import Messages from "@/pages/Messages";
import CommunityEvents from "@/pages/community/Events";
import EventDetail from "@/pages/EventDetail";
import CommunityPeople from "@/pages/community/People";
import CommunityGroups from "@/pages/community/Groups";
import Growth from "@/pages/Growth";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
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
            <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
            <Route path="/dashboard/gym-admin" element={<GymAdminDashboard />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/trainers/:slug" element={<TrainerProfile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/community/events" element={<CommunityEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/community/people" element={<CommunityPeople />} />
            <Route path="/community/groups" element={<CommunityGroups />} />
            <Route path="/growth" element={<Growth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/trainers" element={<Admin />} />
            <Route path="/admin/classes" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
