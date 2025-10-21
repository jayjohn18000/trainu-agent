import { Ring } from "@/components/ui/Ring";
import { Badge } from "@/components/ui/badge";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";

export function TrainerLevelDisplay() {
  const { progress } = useTrainerGamification();

  const progressPercentage = progress.totalXpForNextLevel > 0
    ? ((progress.totalXpForNextLevel - progress.xpToNext) / progress.totalXpForNextLevel) * 100
    : 0;

  const tierColors = {
    'Rookie Agent': 'hsl(var(--info))',
    'Agent Apprentice': 'hsl(var(--success))',
    'Agent Master': 'hsl(var(--warning))',
    'Agent Legend': 'hsl(var(--primary))',
  };

  const color = tierColors[progress.title as keyof typeof tierColors] || tierColors['Rookie Agent'];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      <Ring
        value={progressPercentage}
        size={48}
        thickness={4}
        color={color}
      >
        <span className="text-sm font-bold">{progress.level}</span>
      </Ring>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            variant="secondary" 
            className="text-xs font-semibold"
            style={{ 
              backgroundColor: `${color}/10`,
              color: color,
              borderColor: `${color}/30`
            }}
          >
            {progress.title}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {progress.xpToNext > 0 ? (
            <>{progress.xpToNext} XP to level {progress.level + 1}</>
          ) : (
            <>Max level!</>
          )}
        </p>
      </div>
    </div>
  );
}
