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

export type TourType = 'main' | 'ai-agent';

interface TourOverlayProps {
  active: boolean;
  onComplete: () => void;
  onSkip: () => void;
  tourType?: TourType;
}

const mainTourSteps: TourStep[] = [
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

const aiAgentTourSteps: TourStep[] = [
  {
    target: "[data-tour='ai-chat-input']",
    title: "AI Agent Chat",
    description: "Ask your AI agent to schedule sessions, assign programs, get client insights, and more!",
    position: "top",
  },
  {
    target: "[data-tour='ai-capabilities']",
    title: "Agent Capabilities",
    description: "See what your AI agent can do - from managing sessions to analyzing client data.",
    position: "bottom",
  },
  {
    target: "[data-tour='ai-history']",
    title: "Conversation History",
    description: "View past conversations with your AI agent. Click the message icon to see history.",
    position: "left",
  },
  {
    target: "[data-tour='ai-clear']",
    title: "Reset Conversation",
    description: "Clear the conversation history to give the AI a fresh start with updated capabilities.",
    position: "top",
  },
];

export function TourOverlay({ active, onComplete, onSkip, tourType = 'main' }: TourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const tourSteps = tourType === 'main' ? mainTourSteps : aiAgentTourSteps;

  // Wait for page to be fully ready before starting tour
  useEffect(() => {
    if (!active) return;

    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 1000); // 1 second delay after activation

    return () => clearTimeout(readyTimer);
  }, [active]);

  useEffect(() => {
    if (!active || !isReady) return;

    const updatePosition = () => {
      const target = document.querySelector(tourSteps[currentStep].target);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
        setRetryCount(0); // Reset retry count on success
      } else {
        // Retry finding the element up to 10 times (5 seconds total)
        if (retryCount < 10) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 500);
        } else {
          console.warn(`Tour step ${currentStep} target not found after retries, skipping step`);
          // Skip to next step instead of hiding entire tour
          if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setRetryCount(0);
          } else {
            // If it's the last step and still not found, complete the tour
            onComplete();
          }
        }
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [active, isReady, currentStep, retryCount, onComplete, tourSteps]);

  // Handle Escape key to close tour
  useEffect(() => {
    if (!active) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [active]);

  if (!active || !targetRect || isClosing) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (isLastStep) {
        onComplete();
      } else {
        setIsClosing(false);
        setCurrentStep(prev => prev + 1);
      }
    }, 300);
  };

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(() => {
      onSkip();
    }, 300);
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
      <div 
        className={`fixed inset-0 bg-black/60 z-[9998] ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={handleSkip}
      />

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
      <Card 
        className={`w-80 z-[9999] shadow-glow-intense ${isClosing ? 'animate-fade-out' : 'animate-scale-in'}`}
        style={getTooltipStyle()}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg">{step.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {step.description}
          </p>

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
