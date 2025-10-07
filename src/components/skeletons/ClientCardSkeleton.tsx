import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Skeleton className="h-12 w-12 rounded-full" />

        <div className="flex-1 space-y-3">
          {/* Name and Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>

          {/* Program */}
          <Skeleton className="h-4 w-48" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Progress Bar */}
          <Skeleton className="h-2 w-full rounded-full" />

          {/* Revenue */}
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </Card>
  );
}

export function ClientCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ClientCardSkeleton key={i} />
      ))}
    </div>
  );
}
