import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Update {
  client: string;
  update: string;
  time: string;
}

interface RecentUpdatesProps {
  updates?: Update[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

export function RecentUpdates({ 
  updates = [], 
  onViewAll,
  isLoading = false,
}: RecentUpdatesProps) {
  if (isLoading) {
    return (
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Recent Client Updates</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" disabled>
          View All Updates
        </Button>
      </div>
    );
  }

  const displayUpdates = updates && updates.length > 0 ? updates : [];

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold mb-4">Recent Client Updates</h3>
      <div className="space-y-3">
        {displayUpdates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No recent updates</p>
            <p className="text-xs text-muted-foreground">Client activity will appear here</p>
          </div>
        ) : (
          displayUpdates.slice(0, 5).map((update, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{update.client}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{update.update}</p>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{update.time}</p>
            </div>
          ))
        )}
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={onViewAll}>
        View All Updates
      </Button>
    </div>
  );
}
