import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTrainerBySlug, listSessionTypesByTrainer, type Trainer, type SessionType } from "@/lib/mock/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, CheckCircle2, Calendar, ArrowLeft, MessageSquare, Clock, Users, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TrainerProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);

  useEffect(() => {
    loadTrainer();
  }, [slug]);

  const loadTrainer = async () => {
    if (!slug) return;
    setLoading(true);
    const data = await getTrainerBySlug(slug);
    if (data) {
      setTrainer(data);
      const sessions = await listSessionTypesByTrainer(data.id);
      setSessionTypes(sessions);
    }
    setLoading(false);
  };

  const handleBookSession = async (sessionType: SessionType) => {
    setBooking(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast({
      title: "Booking initiated!",
      description: `Redirecting to book ${sessionType.title}...`,
    });
    setBooking(false);
    // In real app: navigate to booking wizard with sessionTypeId
  };

  const handleSendMessage = () => {
    navigate("/messages");
    toast({
      title: "Opening messages",
      description: `Start a conversation with ${trainer?.name.split(" ")[0]}.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Trainer not found</p>
          <Button onClick={() => navigate("/discover")}>Back to Discover</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        <img
          src={trainer.avatarUrl}
          alt={trainer.name}
          className="h-24 w-24 rounded-full object-cover border-2 border-border"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{trainer.name}</h1>
            {trainer.verified && <CheckCircle2 className="h-6 w-6 text-primary" />}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {trainer.city}, {trainer.state}
            </div>
            {trainer.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium text-foreground">{trainer.rating}</span>
                <span>({trainer.reviewCount} reviews)</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {trainer.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
          {trainer.bio && <p className="text-muted-foreground">{trainer.bio}</p>}
        </div>
        <Button onClick={handleSendMessage} variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>
      </div>

      {/* Session Types */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Session Types</h2>
        {sessionTypes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No session types available</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sessionTypes.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{session.title}</h3>
                  <Badge variant={session.mode === "virtual" ? "secondary" : "default"}>
                    {session.mode === "virtual" ? "Virtual" : "In-Person"}
                  </Badge>
                </div>
                {session.description && (
                  <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {session.duration} min
                  </div>
                  {session.capacity > 1 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Up to {session.capacity}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${(session.price / 100).toFixed(2)}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleBookSession(session)}
                  disabled={booking}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {booking ? "Booking..." : "Book Now"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Client Testimonials</h2>
        <div className="space-y-4">
          {[
            {
              name: "Alex Johnson",
              text: "Best trainer I've ever worked with! Saw amazing results in just 3 months.",
              rating: 5,
            },
            {
              name: "Jamie Smith",
              text: "Professional, knowledgeable, and really cares about helping you reach your goals.",
              rating: 5,
            },
          ].map((testimonial, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="mb-2">{testimonial.text}</p>
              <p className="text-sm text-muted-foreground">— {testimonial.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
