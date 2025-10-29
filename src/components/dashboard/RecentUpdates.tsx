import { Button } from "@/components/ui/button";

interface Update {
  client: string;
  update: string;
  time: string;
}

interface RecentUpdatesProps {
  updates?: Update[];
  onViewAll?: () => void;
}

export function RecentUpdates({ 
  updates = [], 
  onViewAll 
}: RecentUpdatesProps) {
  const defaultUpdates: Update[] = [
    { client: "Alex Johnson", update: "Completed week 4 of program", time: "2h ago" },
    { client: "Taylor Morgan", update: "New PR: 225lb squat!", time: "5h ago" },
    { client: "Jordan Lee", update: "Check-in photo uploaded", time: "1d ago" },
  ];

  const displayUpdates = updates.length > 0 ? updates : defaultUpdates;

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4">Recent Client Updates</h3>
      <div className="space-y-3">
        {displayUpdates.map((update, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div>
              <p className="font-medium text-foreground">{update.client}</p>
              <p className="text-sm text-muted-foreground">{update.update}</p>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{update.time}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={onViewAll}>
        View All Updates
      </Button>
    </div>
  );
}

