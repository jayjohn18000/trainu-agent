import { useParams, Link } from "react-router-dom";
import { events, communityMembers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, ArrowLeft, UserPlus } from "lucide-react";
import { format } from "date-fns";

export default function EventDetail() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Event not found</p>
          <Link to="/community">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  const friendsGoing = communityMembers.slice(0, 3);
  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative aspect-video w-full bg-secondary overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <Link to="/community" className="absolute top-6 left-6">
          <Button variant="secondary" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 space-y-6 pb-12">
        {/* Event Info Card */}
        <div className="metric-card">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">{event.attending} attending</span>
              </div>
              <Button size="lg" className="gap-2">
                <UserPlus className="h-5 w-5" />
                RSVP to Event
              </Button>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="metric-card">
          <h2 className="text-2xl font-bold mb-4">About This Event</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Join us for an incredible fitness experience! This event is designed to bring our community together
              for a fun and challenging workout session. Whether you're a beginner or an advanced athlete, there's
              something for everyone.
            </p>
            <p>
              Our experienced trainers will guide you through the session, ensuring proper form and maximum results.
              Bring your energy, enthusiasm, and get ready to push your limits!
            </p>
            <p>
              <strong className="text-foreground">What to bring:</strong> Water bottle, towel, comfortable workout attire, and a positive attitude!
            </p>
          </div>
        </div>

        {/* Friends Going */}
        <div className="metric-card">
          <h2 className="text-2xl font-bold mb-4">Friends Going</h2>
          <div className="space-y-3">
            {friendsGoing.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt={member.name} />
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.gym}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">
              View All {event.attending} Attendees
            </Button>
          </div>
        </div>

        {/* Share or Invite */}
        <div className="metric-card">
          <h2 className="text-xl font-bold mb-4">Invite Friends</h2>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Share Event</Button>
            <Button variant="outline" className="flex-1">Invite a Friend</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
