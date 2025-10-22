import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityFeedItemSkeleton() {
  return (
    <div className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
      <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ActivityFeedItemSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
