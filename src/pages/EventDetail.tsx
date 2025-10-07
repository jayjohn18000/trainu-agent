import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { getEvent, registerForEvent, isRegistered } from "@/lib/mock/api-extended";
import type { Event } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [registered, setRegistered] = useState(false);
  
  useEffect(() => {
    loadEvent();
  }, [id, user]);

  const loadEvent = async () => {
    if (!id) return;
    const eventData = await getEvent(id);
    setEvent(eventData);
    
    if (user && eventData) {
      const isReg = await isRegistered(id, user.id);
      setRegistered(isReg);
    }
  };

  const handleBuyTicket = async () => {
    if (!event || !user) return;
    
    window.open(event.ticketUrl, '_blank');
    await registerForEvent({ eventId: event.id, userId: user.id });
    setRegistered(true);
    
    toast({
      title: "Registration successful!",
      description: "You're all set for this event"
    });
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Event not found</p>
          <Link to="/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {event.imageUrl && (
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          {registered && <Badge variant="default" className="mb-4">✓ Registered</Badge>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">${event.price}</div>
          {!registered ? (
            <Button className="mt-2 gap-2" size="lg" onClick={handleBuyTicket}>
              Buy Ticket
              <ExternalLink className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" className="mt-2" disabled>Registered</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>{event.capacity} spots available</span>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-muted-foreground">{event.description}</p>
      </div>
    </div>
  );
}
