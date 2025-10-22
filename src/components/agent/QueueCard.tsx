import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Check, Edit, Undo } from "lucide-react";
import { useState } from "react";
import type { QueueItem } from "@/types/agent";

interface QueueCardProps {
  item: QueueItem;
  onApprove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onUndo?: (id: string) => void;
  showUndo?: boolean;
}

export function QueueCard({
  item,
  onApprove,
  onEdit,
  onUndo,
  showUndo = false,
}: QueueCardProps) {
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const handleApprove = () => {
    setIsSliding(true);
    setTimeout(() => {
      onApprove?.(item.id);
    }, 300);
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
      className={`transition-all hover:shadow-md ${
        isSliding ? "animate-slide-out-left" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base mb-1">{item.clientName}</div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.preview}
            </p>
          </div>
          <Badge variant={badge.variant} className={badge.className}>
            {Math.round(item.confidence * 100)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Why Suggested */}
        <Collapsible open={isWhyOpen} onOpenChange={setIsWhyOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isWhyOpen ? "rotate-180" : ""
              }`}
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
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
          ) : (
            <>
              {onApprove && (
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="flex-1"
                  data-tour="approve-btn"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
