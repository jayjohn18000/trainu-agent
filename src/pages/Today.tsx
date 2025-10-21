import { fixtures } from "@/lib/fixtures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Today() {
  const queue = fixtures.queue;
  const feed = fixtures.feed;

  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Queue */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Today</h1>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Queue</h2>
            {queue.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  All caught up! 🎉
                </CardContent>
              </Card>
            ) : (
              queue.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{item.clientName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.preview}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.confidence >= 0.8
                            ? "default"
                            : item.confidence >= 0.5
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <strong>Why suggested:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {item.why.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <aside className="lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {feed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {feed.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium">{item.client}</div>
                      <div className="text-muted-foreground">
                        {item.action} • {item.why}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(item.ts).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
