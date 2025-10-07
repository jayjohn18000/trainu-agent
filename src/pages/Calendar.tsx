import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { RescheduleModal } from "@/components/booking/RescheduleModal";
import { CancelModal } from "@/components/booking/CancelModal";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { SessionList } from "@/components/calendar/SessionList";
import { AvailabilityDialog } from "@/components/calendar/AvailabilityDialog";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { calendarApi } from "@/services/calendar";
import type { Session } from "@/lib/store/useCalendarStore";

export default function Calendar() {
  const { user } = useAuthStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const [cancelSession, setCancelSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    sessions,
    selectedDate,
    viewMode,
    setSessions,
    setSelectedDate,
    updateSession,
    getFilteredSessions,
  } = useCalendarStore();

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await calendarApi.getSessions(
        user.role === "trainer" ? user.id : undefined,
        user.role === "client" ? user.id : undefined
      );
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = (session: Session) => {
    toast({
      title: "Join Session",
      description: "Opening virtual session...",
    });
  };

  const handleMarkComplete = async (session: Session) => {
    try {
      await calendarApi.markSessionComplete(session.id);
      await loadSessions();
      toast({
        title: "Session Completed",
        description: "Session marked as complete",
      });
    } catch (error) {
      console.error("Failed to mark session complete:", error);
      toast({
        title: "Error",
        description: "Failed to mark session complete",
        variant: "destructive",
      });
    }
  };

  const handleMarkNoShow = async (session: Session) => {
    try {
      await calendarApi.markSessionNoShow(session.id);
      await loadSessions();
      toast({
        title: "Session Updated",
        description: "Session marked as no-show",
      });
    } catch (error) {
      console.error("Failed to mark no-show:", error);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    }
  };

  const filteredSessions = getFilteredSessions();
  const upcomingSessions = filteredSessions.filter((s) => s.status === "upcoming");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">
            {user?.role === "client" && "View and manage your upcoming sessions"}
            {user?.role === "trainer" && "Manage your availability and sessions"}
            {user?.role === "gym_admin" && "View facility schedule and bookings"}
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === "client" && (
            <Button onClick={() => setBookingOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          )}
          {user?.role === "trainer" && (
            <Button onClick={() => setAvailabilityOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Availability
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        selectedDate={selectedDate}
        sessions={filteredSessions}
        onDateSelect={setSelectedDate}
        onMonthChange={setSelectedDate}
      />

      {/* Upcoming Sessions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {user?.role === "client" && "Your Upcoming Sessions"}
          {user?.role === "trainer" && "Your Schedule"}
          {user?.role === "gym_admin" && "Facility Sessions"}
        </h3>
        <SessionList
          sessions={upcomingSessions}
          onReschedule={setRescheduleSession}
          onCancel={setCancelSession}
          onJoin={handleJoinSession}
          onMarkComplete={handleMarkComplete}
          onMarkNoShow={handleMarkNoShow}
          userRole={user?.role}
        />
      </div>

      {/* Booking Wizard */}
      <BookingWizard open={bookingOpen} onOpenChange={setBookingOpen} />

      {/* Availability Dialog */}
      {user?.role === "trainer" && (
        <AvailabilityDialog
          open={availabilityOpen}
          onOpenChange={setAvailabilityOpen}
          trainerId={user.id}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <RescheduleModal
          open={!!rescheduleSession}
          onOpenChange={(open) => {
            if (!open) setRescheduleSession(null);
          }}
          session={rescheduleSession}
          onSuccess={loadSessions}
        />
      )}

      {/* Cancel Modal */}
      {cancelSession && (
        <CancelModal
          open={!!cancelSession}
          onOpenChange={(open) => {
            if (!open) setCancelSession(null);
          }}
          session={cancelSession}
          onSuccess={loadSessions}
        />
      )}
    </div>
  );
}
