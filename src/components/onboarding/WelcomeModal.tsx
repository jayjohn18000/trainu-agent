import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, TrendingUp, CheckCircle } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour: () => void;
}

export function WelcomeModal({ open, onOpenChange, onStartTour }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Sparkles,
      title: "Welcome to TrainU Agent",
      description: "Your AI-powered assistant that helps you engage with clients 10x faster.",
      highlight: "Save hours every week while building stronger relationships.",
    },
    {
      icon: Zap,
      title: "Review & Approve Messages",
      description: "Your agent drafts personalized check-ins, nudges, and responses. You review and approve with one click.",
      highlight: "3 minutes per message → 10 seconds.",
    },
    {
      icon: TrendingUp,
      title: "Level Up & Earn Achievements",
      description: "Every action you take earns XP. Unlock achievements, climb levels, and track your impact.",
      highlight: "Gamification keeps you motivated.",
    },
    {
      icon: CheckCircle,
      title: "You're in Control",
      description: "The agent suggests, you decide. Edit any message, adjust the tone, or skip entirely.",
      highlight: "Your voice, amplified by AI.",
    },
  ];

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onOpenChange(false);
      onStartTour();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    localStorage.setItem("welcomeShown", "true");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col items-center text-center py-6 px-4">
          {/* Icon */}
          <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
            <Icon className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3">{currentSlideData.title}</h2>

          {/* Description */}
          <p className="text-muted-foreground mb-4 max-w-md">
            {currentSlideData.description}
          </p>

          {/* Highlight */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-primary">
              {currentSlideData.highlight}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2 mb-6">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLastSlide ? "Start Tour" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
