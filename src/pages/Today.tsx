import { useState } from "react";
import { fixtures } from "@/lib/fixtures";
import { QueueCard } from "@/components/agent/QueueCard";
import { ActivityFeed } from "@/components/agent/ActivityFeed";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Today() {
  const [queue, setQueue] = useState(fixtures.queue);
  const [feed, setFeed] = useState(fixtures.feed);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    // Remove from queue
    setQueue((prev) => prev.filter((q) => q.id !== id));

    // Add to feed
    const feedItem = {
      ts: new Date().toISOString(),
      action: "sent" as const,
      client: item.clientName,
      status: "success" as const,
      why: item.why.join(", "),
    };
    setFeed((prev) => [feedItem, ...prev]);

    toast({
      title: "Message approved",
      description: `Draft to ${item.clientName} will be sent.`,
    });
  };

  const handleEdit = (id: string) => {
    toast({
      title: "Edit draft",
      description: "Opening editor...",
    });
    // TODO: Open edit drawer
  };

  const handleUndo = (id: string) => {
    // TODO: Implement undo logic
    toast({
      title: "Action undone",
      description: "Draft returned to queue.",
    });
  };

  // Keyboard shortcuts for current item
  useKeyboardShortcuts([
    {
      key: "a",
      callback: () => {
        if (queue.length > 0 && queue[selectedIndex]) {
          handleApprove(queue[selectedIndex].id);
        }
      },
      description: "Approve current item",
    },
    {
      key: "e",
      callback: () => {
        if (queue.length > 0 && queue[selectedIndex]) {
          handleEdit(queue[selectedIndex].id);
        }
      },
      description: "Edit current item",
    },
  ]);

  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Queue */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Today</h1>
            {queue.length > 0 && (
              <Button variant="outline" size="sm">
                Approve All Safe
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Queue {queue.length > 0 && `(${queue.length})`}
            </h2>
            {queue.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-lg font-medium mb-2">All caught up!</p>
                  <p className="text-sm text-muted-foreground">
                    No pending drafts at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              queue.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={selectedIndex === idx ? "ring-2 ring-primary rounded-lg" : ""}
                >
                  <QueueCard
                    item={item}
                    onApprove={handleApprove}
                    onEdit={handleEdit}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <aside className="lg:w-80 hidden lg:block">
          <ActivityFeed items={feed} />
        </aside>
      </div>
    </div>
  );
}
