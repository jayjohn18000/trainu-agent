import { useState } from "react";
import { fixtures } from "@/lib/fixtures";
import { QueueCard } from "@/components/agent/QueueCard";
import { ActivityFeed } from "@/components/agent/ActivityFeed";
import { MessageEditor } from "@/components/agent/MessageEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { TrainerXPNotification } from "@/components/gamification/TrainerXPNotification";
import { Zap } from "lucide-react";
import type { QueueItem } from "@/types/agent";

export default function Today() {
  const [queue, setQueue] = useState(fixtures.queue);
  const [feed, setFeed] = useState(fixtures.feed);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const { toast } = useToast();
  const { awardXP } = useTrainerGamification();

  const handleApprove = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    // Remove from queue
    setQueue((prev) => prev.filter((q) => q.id !== id));

    // Add to feed with approval timestamp
    const feedItem = {
      id: `feed-${Date.now()}-${id}`,
      ts: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      action: "sent" as const,
      client: item.clientName,
      clientId: id,
      status: "success" as const,
      why: item.why.join(", "),
      messagePreview: item.preview,
      confidence: item.confidence,
    };
    setFeed((prev) => [feedItem, ...prev]);

    // Award XP
    awardXP(25, "Approved message");

    toast({
      title: "Message approved",
      description: `Draft to ${item.clientName} will be sent. +25 XP`,
    });
  };

  const handleEdit = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    setEditingItem(item);
  };

  const handleSaveEdit = (updatedMessage: string, tone: string) => {
    if (!editingItem) return;
    
    // Update queue item
    setQueue((prev) =>
      prev.map((q) =>
        q.id === editingItem.id
          ? { ...q, preview: updatedMessage }
          : q
      )
    );

    // Award XP
    awardXP(50, "Edited message");

    toast({
      title: "Message updated",
      description: `Draft updated with ${tone} tone. +50 XP`,
    });

    setEditingItem(null);
  };

  const handleUndo = (feedItemId: string) => {
    const feedItem = feed.find((f) => f.id === feedItemId);
    if (!feedItem || !feedItem.clientId) return;

    // Move back to queue
    const queueItem: QueueItem = {
      id: feedItem.clientId,
      clientId: feedItem.clientId,
      clientName: feedItem.client,
      preview: feedItem.messagePreview || '',
      confidence: feedItem.confidence || 0.8,
      status: "review",
      why: feedItem.why.split(", "),
      createdAt: new Date().toISOString(),
    };

    setQueue((prev) => [queueItem, ...prev]);
    setFeed((prev) => prev.filter((f) => f.id !== feedItemId));

    // Small penalty
    awardXP(-10, "Undid message");

    toast({
      title: "Message recalled",
      description: "Draft returned to queue. -10 XP",
    });
  };

  const handleApproveAllSafe = () => {
    const safeItems = queue.filter(item => item.confidence >= 0.8);
    
    if (safeItems.length === 0) {
      toast({
        title: "No safe items",
        description: "All items need manual review.",
      });
      return;
    }

    // Batch approve with staggered animation
    safeItems.forEach((item, index) => {
      setTimeout(() => {
        handleApprove(item.id);
      }, index * 200);
    });

    // Bonus XP for batch efficiency
    if (safeItems.length >= 3) {
      setTimeout(() => {
        awardXP(75, "Efficiency bonus");
      }, safeItems.length * 200 + 100);
    }

    toast({
      title: `Approving ${safeItems.length} safe messages`,
      description: `+${safeItems.length * 25 + (safeItems.length >= 3 ? 75 : 0)} XP total`,
    });
  };

  // Keyboard shortcuts
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
    {
      key: "A",
      shift: true,
      callback: handleApproveAllSafe,
      description: "Approve all safe items",
    },
  ]);

  const safeItemsCount = queue.filter(item => item.confidence >= 0.8).length;

  return (
    <>
      <TrainerXPNotification />
      
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Queue */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Today</h1>
              {safeItemsCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleApproveAllSafe}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Approve {safeItemsCount} Safe
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
          <ActivityFeed items={feed} onUndo={handleUndo} />
        </aside>
      </div>
    </div>

    {/* Message Editor */}
    {editingItem && (
      <MessageEditor
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        queueItem={editingItem}
        onSave={handleSaveEdit}
      />
    )}
  </>
  );
}
