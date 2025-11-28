import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Loader2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, differenceInDays } from "date-fns";

interface StreakCellProps {
  clientId: string;
  currentStreak: number;
  lastCheckinAt: string | null;
  onCheckinComplete?: () => void;
}

export function StreakCell({ 
  clientId, 
  currentStreak, 
  lastCheckinAt,
  onCheckinComplete 
}: StreakCellProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const now = new Date();
      let newStreak = currentStreak;
      
      if (lastCheckinAt) {
        const lastCheckin = new Date(lastCheckinAt);
        const daysSinceLastCheckin = differenceInDays(now, lastCheckin);
        
        if (daysSinceLastCheckin < 7) {
          toast({
            title: "Already checked in",
            description: "This client was checked in within the last 7 days.",
          });
          setIsLoading(false);
          return;
        }
        
        // If more than 14 days, streak is broken - reset to 1
        if (daysSinceLastCheckin > 14) {
          newStreak = 1;
          toast({
            title: "Streak reset",
            description: "More than 2 weeks passed - starting fresh!",
          });
        } else {
          // Within 7-14 days - increment streak
          newStreak = currentStreak + 1;
        }
      } else {
        // First checkin ever
        newStreak = 1;
      }

      const { error } = await supabase
        .from('contacts')
        .update({
          current_streak: newStreak,
          last_checkin_at: now.toISOString(),
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Check-in recorded! 🔥",
        description: `${newStreak} week streak!`,
      });

      onCheckinComplete?.();

    } catch (error) {
      console.error("Check-in failed:", error);
      toast({
        title: "Check-in failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canCheckin = !lastCheckinAt || differenceInDays(new Date(), new Date(lastCheckinAt)) >= 7;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={currentStreak > 0 ? "default" : "secondary"} 
              className={`gap-1 ${currentStreak >= 4 ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            >
              <Flame className="h-3 w-3" />
              {currentStreak}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentStreak} week streak</p>
            {lastCheckinAt && (
              <p className="text-xs text-muted-foreground">
                Last: {formatDistanceToNow(new Date(lastCheckinAt), { addSuffix: true })}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button
        size="sm"
        variant={canCheckin ? "outline" : "ghost"}
        onClick={handleCheckin}
        disabled={isLoading || !canCheckin}
        className="h-7 px-2"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}