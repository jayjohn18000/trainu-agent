import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { events } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { EventCardSkeletonGrid } from "@/components/skeletons/EventCardSkeleton";
import { Calendar, MapPin, Users as UsersIcon } from "lucide-react";

export default function CommunityEvents() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading events
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Community Events</h1>
        <p className="text-muted-foreground mt-1">
          Join group workouts, challenges, and community gatherings.
        </p>
      </div>

      {isLoading ? (
        <EventCardSkeletonGrid />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="block">
            <div className="metric-card hover:card-elevated transition-all">
              <div className="aspect-video bg-secondary rounded-lg mb-4 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>{event.attending} attending</span>
                  </div>
                </div>
                <Button className="w-full">View Details</Button>
              </div>
            </div>
          </Link>
          ))}
        </div>
      )}
    </div>
  );
}
