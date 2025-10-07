import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrainerBySlug, listSessionTypesByTrainer, type Trainer, type SessionType } from "@/lib/mock/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, CheckCircle2, Calendar, MessageSquare, Clock, Users, DollarSign, Award, TrendingUp, Zap, Video, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default function TrainerProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);

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

  const handleBookSession = () => {
    setBookingWizardOpen(true);
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
    <>
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
              {trainer.stats?.responseTime && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm">{trainer.stats.responseTime}</span>
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
          <div className="flex gap-2">
            <Button onClick={handleSendMessage} variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button onClick={handleBookSession} className="gap-2">
              <Calendar className="h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {trainer.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trainer.stats.totalClients && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{trainer.stats.totalClients}+</div>
                    <div className="text-sm text-muted-foreground">Clients Trained</div>
                  </div>
                </div>
              </Card>
            )}
            {trainer.stats.yearsExperience && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{trainer.stats.yearsExperience}</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </Card>
            )}
            {trainer.stats.sessionsCompleted && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{trainer.stats.sessionsCompleted.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                </div>
              </Card>
            )}
            {trainer.rating && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{trainer.rating}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Video Introduction */}
        {trainer.videoIntroUrl && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Introduction Video</h2>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Video player placeholder</p>
            </div>
          </Card>
        )}

        {/* Certifications */}
        {trainer.certifications && trainer.certifications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Certifications & Credentials</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {trainer.certifications.map((cert, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cert.year}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Availability Preview */}
        {trainer.availability && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Availability</h2>
            <div className="space-y-3">
              {trainer.availability.daysAvailable && (
                <div>
                  <p className="text-sm font-medium mb-2">Available Days</p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.availability.daysAvailable.map((day) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {trainer.availability.timeRanges && (
                <div>
                  <p className="text-sm font-medium mb-2">Typical Hours</p>
                  <div className="flex flex-wrap gap-2">
                    {trainer.availability.timeRanges.map((time, idx) => (
                      <Badge key={idx} variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

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
                <Card key={session.id} className="p-6 hover:border-primary/50 transition-all">
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
                    onClick={handleBookSession}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Client Transformations */}
        {trainer.transformations && trainer.transformations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Client Transformations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {trainer.transformations.map((transformation, idx) => (
                <Card key={idx} className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Before</p>
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={transformation.beforeImg} 
                          alt="Before" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">After</p>
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={transformation.afterImg} 
                          alt="After" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{transformation.clientName}</p>
                    <p className="text-sm text-muted-foreground">{transformation.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

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

      <BookingWizard open={bookingWizardOpen} onOpenChange={setBookingWizardOpen} />
    </>
  );
}
