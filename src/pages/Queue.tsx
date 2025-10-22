import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fixtures } from "@/lib/fixtures";
import { QueueCard } from "@/components/agent/QueueCard";
import { ProgramBuilderCard } from "@/components/agent/ProgramBuilderCard";
import { MessageEditor } from "@/components/agent/MessageEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { useAchievementTracker } from "@/hooks/useAchievementTracker";
import { ArrowLeft, Zap, CheckCircle } from "lucide-react";
import type { QueueItem } from "@/types/agent";

export default function Queue() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(fixtures.queue);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const { toast } = useToast();
  const { awardXP } = useTrainerGamification();
  const { updateStats } = useAchievementTracker();

  const handleApprove = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    setQueue((prev) => prev.filter((q) => q.id !== id));
    
    awardXP(25, "Approved message");
    updateStats({
      messagesSentToday: fixtures.feed.length + 1,
      messagesSentTotal: fixtures.feed.length + 1,
      timeSavedHours: ((fixtures.feed.length + 1) * 5) / 60,
    });

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
    
    setQueue((prev) =>
      prev.map((q) =>
        q.id === editingItem.id
          ? { ...q, preview: updatedMessage }
          : q
      )
    );

    awardXP(50, "Edited message");
    updateStats({
      messagesEdited: (fixtures.feed.filter(f => f.action === 'sent').length || 0) + 1,
    });

    toast({
      title: "Message updated",
      description: `Draft updated with ${tone} tone. +50 XP`,
    });

    setEditingItem(null);
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

    safeItems.forEach((item, index) => {
      setTimeout(() => {
        handleApprove(item.id);
      }, index * 200);
    });

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

  const safeItemsCount = queue.filter(item => item.confidence >= 0.8).length;

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/today')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Message Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve AI-drafted messages
          </p>
        </div>

        {safeItemsCount > 0 && (
          <Button 
            variant="default" 
            onClick={handleApproveAllSafe}
          >
            <Zap className="h-4 w-4 mr-2" />
            Approve {safeItemsCount} Safe
          </Button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold">{queue.length}</div>
          <div className="text-sm text-muted-foreground">Total in Queue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-success">{safeItemsCount}</div>
          <div className="text-sm text-muted-foreground">Safe to Approve</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-warning">
            {queue.filter(item => item.confidence < 0.8).length}
          </div>
          <div className="text-sm text-muted-foreground">Needs Review</div>
        </Card>
      </div>

      {/* Queue Items */}
      {queue.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-16 w-16 text-success" />
            <div>
              <h3 className="text-xl font-semibold mb-2">All Caught Up! 🎉</h3>
              <p className="text-muted-foreground">
                Great work! No pending items in your queue.
              </p>
            </div>
            <Button onClick={() => navigate('/today')}>
              Back to Today
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item.id)}
              onEdit={() => handleEdit(item.id)}
            />
          ))}
          <ProgramBuilderCard />
        </div>
      )}

      {/* Message Editor */}
      {editingItem && (
        <MessageEditor
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          queueItem={editingItem}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
