import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { listEvents, listEventRegistrations, registerForEvent } from "@/lib/mock/api-extended";
import type { Event, EventRegistration } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Events() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    const allEvents = await listEvents();
    setEvents(allEvents);
    
    if (user) {
      const userRegs = await listEventRegistrations(user.id);
      setRegistrations(userRegs);
    }
  };

  const isRegistered = (eventId: string) => 
    registrations.some(r => r.eventId === eventId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Events</h1>
        <p className="text-muted-foreground">Join us for workshops, challenges, and social gatherings</p>
      </div>

      {events.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No events scheduled"
          description="Check back soon for upcoming events"
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Link key={event.id} to={`/events/${event.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
              {event.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {isRegistered(event.id) && (
                      <Badge variant="secondary">Registered</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.capacity} spots available</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-bold text-lg">${event.price}</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
