import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

interface TourOverlayProps {
  active: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='queue']",
    title: "Review Queue",
    description: "AI-drafted messages appear here. Click to review, edit, or approve instantly.",
    position: "right",
  },
  {
    target: "[data-tour='approve-btn']",
    title: "Quick Actions",
    description: "Approve individual messages or batch-approve all safe items (80%+ confidence).",
    position: "bottom",
  },
  {
    target: "[data-tour='metrics']",
    title: "Track Your Impact",
    description: "See time saved, messages sent, and clients helped in real-time.",
    position: "left",
  },
  {
    target: "[data-tour='feed']",
    title: "Activity Feed",
    description: "Approved messages and actions appear here. Undo within 5 minutes if needed.",
    position: "top",
  },
  {
    target: "[data-tour='level']",
    title: "Level Up",
    description: "Earn XP for every action. Unlock achievements and track your progress!",
    position: "bottom",
  },
];

export function TourOverlay({ active, onComplete, onSkip }: TourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!active) return;

    const updatePosition = () => {
      const target = document.querySelector(tourSteps[currentStep].target);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
      } else {
        // Reset to null if target not found - this will hide the overlay
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [active, currentStep]);

  if (!active || !targetRect) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Calculate tooltip position
  const getTooltipStyle = () => {
    const offset = 20;
    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
    };

    switch (step.position) {
      case "right":
        style.left = targetRect.right + offset;
        style.top = targetRect.top;
        break;
      case "left":
        style.right = window.innerWidth - targetRect.left + offset;
        style.top = targetRect.top;
        break;
      case "bottom":
        style.left = targetRect.left;
        style.top = targetRect.bottom + offset;
        break;
      case "top":
        style.left = targetRect.left;
        style.bottom = window.innerHeight - targetRect.top + offset;
        break;
    }

    return style;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[9998] animate-fade-in" />

      {/* Highlight */}
      <div
        className="fixed z-[9999] ring-4 ring-primary rounded-lg pointer-events-none animate-pulse-glow"
        style={{
          left: targetRect.left - 4,
          top: targetRect.top - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <Card className="w-80 z-[9999] animate-scale-in shadow-glow-intense" style={getTooltipStyle()}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg">{step.title}</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full ${
                    idx === currentStep ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <Button size="sm" onClick={handleNext}>
              {isLastStep ? "Finish" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
