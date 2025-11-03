import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTouchGestures } from "@/hooks/useTouchGestures";
import { cn } from "@/lib/utils";
import type { DraftItem } from "@/lib/store/useDraftsStore";

interface DraftCardProps {
  draft: DraftItem;
  isSelected: boolean;
  onApprove: (id: string) => void;
  onSnooze: (id: string) => Promise<void>;
  onToggleSelected: (id: string) => void;
}

export function DraftCard({ 
  draft, 
  isSelected, 
  onApprove, 
  onSnooze,
  onToggleSelected 
}: DraftCardProps) {
  const { handlers, swipeDirection, swipeProgress } = useTouchGestures({
    onSwipeRight: () => onApprove(draft.id),
    onSwipeLeft: () => onSnooze(draft.id),
    threshold: 40,
  });

  let pressTimer: any;
  const startPress = () => { 
    pressTimer = setTimeout(() => onToggleSelected(draft.id), 450); 
  };
  const endPress = () => { 
    clearTimeout(pressTimer); 
  };

  return (
    <Card
      className={cn(
        "p-3 transition-transform",
        isSelected && "border-primary ring-1 ring-primary/30"
      )}
      style={{ 
        transform: swipeProgress && swipeDirection 
          ? `translateX(${swipeDirection === 'right' ? swipeProgress * 24 : -swipeProgress * 24}px)` 
          : undefined 
      }}
      {...handlers as any}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={(e) => { 
        startPress(); 
        (handlers as any).onTouchStart?.(e); 
      }}
      onTouchEnd={(e) => { 
        endPress(); 
        (handlers as any).onTouchEnd?.(e); 
      }}
      onTouchMove={(e) => { 
        (handlers as any).onTouchMove?.(e); 
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {draft.status === 'scheduled' ? 'Scheduled' : 'Pending'}
            </Badge>
            {draft.scheduled_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(draft.scheduled_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
            {isSelected && (
              <Badge className="text-[10px]" variant="secondary">
                Selected
              </Badge>
            )}
          </div>
          <div className="mt-1">{draft.body}</div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSnooze(draft.id)}
          >
            Snooze
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onApprove(draft.id)}
          >
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}
