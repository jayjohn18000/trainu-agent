import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QueueCard } from "@/components/agent/QueueCard";
import { ProgramBuilderCard } from "@/components/agent/ProgramBuilderCard";
import { MessageEditor } from "@/components/agent/MessageEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { ArrowLeft, Zap, CheckCircle, Loader2 } from "lucide-react";
import type { QueueItem } from "@/types/agent";
import * as agentAPI from "@/lib/api/agent";
import { isQuietHours } from "@/lib/utils/quietHours";

export default function Queue() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { awardXP } = useTrainerGamification();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await agentAPI.getQueue();
      setQueue(data);
    } catch (error) {
      toast({
        title: "Error loading queue",
        description: error instanceof Error ? error.message : "Failed to load queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    try {
      await agentAPI.approveQueueItem(id);
      setQueue((prev) => prev.filter((q) => q.id !== id));
      
      await awardXP(25, "Approved message");

      const inQuietHoursNow = isQuietHours();
      toast({
        title: "Message approved",
        description: inQuietHoursNow
          ? `Queued for delivery (quiet hours: 9 PM - 8 AM CT). +25 XP`
          : `Draft to ${item.clientName} will be sent. +25 XP`,
      });
    } catch (error) {
      toast({
        title: "Failed to approve",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    setEditingItem(item);
  };

  const handleSaveEdit = async (updatedMessage: string, tone: string) => {
    if (!editingItem) return;
    
    try {
      await agentAPI.editQueueItem(editingItem.id, { message: updatedMessage, tone });
      
      setQueue((prev) =>
        prev.map((q) =>
          q.id === editingItem.id
            ? { ...q, preview: updatedMessage }
            : q
        )
      );

      await awardXP(50, "Edited message");

      toast({
        title: "Message updated",
        description: `Draft updated with ${tone} tone. +50 XP`,
      });

      setEditingItem(null);
    } catch (error) {
      toast({
        title: "Failed to save edit",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleApproveAllSafe = async () => {
    const safeItems = queue.filter(item => item.confidence >= 0.8);
    
    if (safeItems.length === 0) {
      toast({
        title: "No safe items",
        description: "All items need manual review.",
      });
      return;
    }

    try {
      const result = await agentAPI.batchApproveQueueItems(0.8);
      
      setQueue((prev) => prev.filter(item => item.confidence < 0.8));

      const xpAmount = result.approved * 25 + (result.approved >= 3 ? 75 : 0);
      await awardXP(xpAmount, "Batch approval");

      toast({
        title: `Approved ${result.approved} messages`,
        description: `+${xpAmount} XP earned`,
      });
    } catch (error) {
      toast({
        title: "Batch approval failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
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
      {loading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading queue...</p>
        </Card>
      ) : queue.length === 0 ? (
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
