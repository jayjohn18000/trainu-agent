import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Check, Edit, Undo, Loader2 } from "lucide-react";
import { useState, memo } from "react";
import type { QueueItem } from "@/types/agent";
import { useTouchGestures } from "@/hooks/useTouchGestures";

interface QueueCardProps {
  item: QueueItem;
  onApprove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onUndo?: (id: string) => void;
  showUndo?: boolean;
  isSelected?: boolean;
}

const QueueCardComponent = ({
  item,
  onApprove,
  onEdit,
  onUndo,
  showUndo = false,
  isSelected = false,
}: QueueCardProps) => {
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [swiped, setSwiped] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Touch gesture support for mobile
  const { handlers, swipeProgress } = useTouchGestures({
    onSwipeRight: () => {
      if (onApprove) {
        setSwiped(true);
        setTimeout(() => {
          onApprove(item.id);
        }, 300);
      }
    },
    threshold: 100,
  });

  const handleApprove = async () => {
    if (isApproving || !onApprove) return;
    
    setIsApproving(true);
    setIsSliding(true);
    
    try {
      await onApprove(item.id);
    } finally {
      // Keep loading state active until parent removes the card
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        variant: "default" as const,
        className: "bg-green-500/10 text-green-700 border-green-500/20",
      };
    }
    if (confidence >= 0.5) {
      return {
        variant: "secondary" as const,
        className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      };
    }
    return {
      variant: "destructive" as const,
      className: "bg-red-500/10 text-red-700 border-red-500/20",
    };
  };

  const badge = getConfidenceBadge(item.confidence);

  return (
    <Card 
      {...handlers}
      className={`transition-all hover:shadow-lg hover-lift touch-pan-y select-none ${
        isSliding || swiped ? "animate-slide-out-left" : ""
      } ${isSelected ? "ring-2 ring-primary shadow-glow" : ""}`}
      style={{
        transform: `translateX(${swipeProgress * 20}px)`,
        opacity: 1 - swipeProgress * 0.3,
      }}
      role="article"
      aria-label={`Queue item for ${item.clientName}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base mb-1">{item.clientName}</div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.preview}
            </p>
          </div>
          <Badge variant={badge.variant} className={badge.className} aria-label={`Confidence: ${Math.round(item.confidence * 100)}%`}>
            {Math.round(item.confidence * 100)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Why Suggested */}
        <Collapsible open={isWhyOpen} onOpenChange={setIsWhyOpen}>
          <CollapsibleTrigger 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View reason for suggestion"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isWhyOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
            Why suggested
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {item.why.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2">
          {showUndo && onUndo ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUndo(item.id)}
              className="flex-1"
              aria-label="Undo message"
            >
              <Undo className="h-4 w-4 mr-2" aria-hidden="true" />
              Undo
            </Button>
          ) : (
            <>
              {onApprove && (
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 btn-press hover:shadow-glow transition-smooth"
                  data-tour="approve-btn"
                  aria-label="Approve and send message"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                      Approve
                    </>
                  )}
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item.id)}
                  aria-label="Edit message"
                >
                  <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize for performance
export const QueueCard = memo(QueueCardComponent);
