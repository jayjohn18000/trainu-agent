import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessagesModal } from "@/components/modals/MessagesModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { SettingsModal } from "@/components/modals/SettingsModal";

export function ModalRouteHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/messages') {
      navigate('/today', { replace: true });
      setMessagesOpen(true);
    } else if (location.pathname === '/calendar') {
      navigate('/today', { replace: true });
      setCalendarOpen(true);
    } else if (location.pathname === '/settings') {
      navigate('/today', { replace: true });
      setSettingsOpen(true);
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <MessagesModal open={messagesOpen} onOpenChange={setMessagesOpen} />
      <CalendarModal open={calendarOpen} onOpenChange={setCalendarOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

