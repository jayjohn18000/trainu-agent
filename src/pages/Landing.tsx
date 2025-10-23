import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Dumbbell, Calendar, Users, TrendingUp, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  // Auto-redirect to trainer dashboard for demo purposes
  // In production, this would check auth state and user role
  useEffect(() => {
    // If this is a demo/testing environment, auto-redirect to trainer view
    const isDemoMode = true; // In production, check auth state
    if (isDemoMode) {
      navigate("/today");
    }
  }, [navigate]);

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Book sessions, manage availability, and sync with your calendar",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with trainers, join groups, and share your journey",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Log workouts, track metrics, and visualize your growth",
    },
    {
      icon: Dumbbell,
      title: "Custom Programs",
      description: "Get personalized training programs from certified trainers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            TrainU
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Connect with certified trainers. Track your progress. Achieve your goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/today")} className="gap-2">
              Trainer Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/me")}>
              Client Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-card p-10 rounded-lg border border-border">
          <h2 className="text-3xl font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of clients and trainers using TrainU to achieve their fitness goals
          </p>
          <Button size="lg" onClick={() => navigate("/discover")} className="gap-2">
            Discover Trainers
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
