import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QueueCard } from "@/components/agent/QueueCard";
import { MessageEditor } from "@/components/agent/MessageEditor";
import { AutoApprovalCountdown } from "@/components/agent/AutoApprovalCountdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { ArrowLeft, Zap, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listDraftsAndQueued, approveMessage, sendNow, type Message } from "@/lib/api/messages";
import type { QueueItem } from "@/types/agent";

export default function Queue() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Record<string, { first_name: string; last_name?: string }>>({});
  const [editingItem, setEditingItem] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const { toast } = useToast();
  const { awardXP } = useTrainerGamification();

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await listDraftsAndQueued(50);
      setMessages(data);
      
      // Hydrate contact names
      const uniqueContactIds = [...new Set(data.map(m => m.contact_id))];
      const { data: contactData } = await supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .in("id", uniqueContactIds);
      
      if (contactData) {
        const contactMap = Object.fromEntries(
          contactData.map(c => [c.id, { first_name: c.first_name, last_name: c.last_name || "" }])
        );
        setContacts(contactMap);
      }
    } catch (error) {
      console.error("Failed to load queue:", error);
      toast({
        title: "Error loading queue",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    
    // Real-time subscription
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => loadQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const result = await approveMessage(id);
      setMessages((prev) => prev.filter((item) => item.id !== id));
      await awardXP(25, "Approved AI draft");
      
      const description = result.deferred_by_quiet_hours 
        ? `Scheduled for ${result.scheduled_for}` 
        : "Message queued for sending";
      
      toast({
        title: "Approved!",
        description,
      });
    } catch (error) {
      console.error("Failed to approve:", error);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await supabase
        .from("messages")
        .delete()
        .eq("id", id);
      
      setMessages((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Rejected",
        description: "Message has been rejected",
      });
    } catch (error) {
      console.error("Failed to reject:", error);
      toast({
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: string) => {
    const item = messages.find((i) => i.id === id);
    if (item) setEditingItem(item);
  };

  const handleSaveEdit = async (id: string, updatedMessage: string, tone: string) => {
    if (!editingItem) return;
    try {
      await supabase
        .from("messages")
        .update({ content: updatedMessage })
        .eq("id", id);
      
      setMessages((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, content: updatedMessage }
            : item
        )
      );
      await awardXP(50, "Edited AI draft");
      setEditingItem(null);
      toast({
        title: "Saved!",
        description: `Your changes have been saved with ${tone} tone.`,
      });
    } catch (error) {
      console.error("Failed to save edit:", error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      const result = await sendNow(id);
      setMessages((prev) => prev.filter((item) => item.id !== id));
      await awardXP(20, "Sent message immediately");
      
      const description = result.deferred 
        ? `Scheduled for ${result.scheduled_for}` 
        : "Message sent successfully";
      
      toast({
        title: "Sent!",
        description,
      });
    } catch (error) {
      console.error("Failed to send:", error);
      toast({
        title: "Send failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleGenerateNewDrafts = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-draft-generator");
      
      if (error) throw error;
      
      await loadQueue();
      toast({
        title: "Drafts generated!",
        description: `Generated ${data.generated} new drafts, cleaned ${data.cleaned} expired ones.`,
      });
    } catch (error) {
      console.error("Failed to generate drafts:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAllSafe = async () => {
    try {
      const safeMessages = messages.filter((item) => (item.confidence || 0) >= 0.8);
      
      if (safeMessages.length === 0) {
        toast({
          title: "No safe items",
          description: "All items need manual review.",
        });
        return;
      }

      await Promise.all(safeMessages.map(msg => approveMessage(msg.id)));
      
      setMessages((prev) => prev.filter((item) => (item.confidence || 0) < 0.8));
      await awardXP(
        safeMessages.length * 25 + (safeMessages.length >= 3 ? 75 : 0),
        `Batch approved ${safeMessages.length} messages`
      );

      toast({
        title: "Batch approved!",
        description: `Approved ${safeMessages.length} high-confidence messages.`,
      });
    } catch (error) {
      console.error("Failed to batch approve:", error);
      toast({
        title: "Batch approval failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(Array.from(selectedIds).map(id => approveMessage(id)));
      
      setMessages((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      await awardXP(
        selectedIds.size * 25 + (selectedIds.size >= 3 ? 75 : 0),
        `Bulk approved ${selectedIds.size} messages`
      );

      toast({
        title: "Bulk approved!",
        description: `Approved ${selectedIds.size} selected messages.`,
      });
      
      setSelectedIds(new Set());
      setBulkActionMode(false);
    } catch (error) {
      console.error("Failed to bulk approve:", error);
      toast({
        title: "Bulk approval failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          supabase.from("messages").delete().eq("id", id)
        )
      );
      
      setMessages((prev) => prev.filter((item) => !selectedIds.has(item.id)));

      toast({
        title: "Bulk rejected!",
        description: `Rejected ${selectedIds.size} selected messages.`,
      });
      
      setSelectedIds(new Set());
      setBulkActionMode(false);
    } catch (error) {
      console.error("Failed to bulk reject:", error);
      toast({
        title: "Bulk rejection failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(messages.map(m => m.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const safeItemsCount = messages.filter((item) => (item.confidence || 0) >= 0.8).length;

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

        <div className="flex gap-2">
          {bulkActionMode ? (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleBulkApprove}
                disabled={selectedIds.size === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve ({selectedIds.size})
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkReject}
                disabled={selectedIds.size === 0}
              >
                Reject ({selectedIds.size})
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setBulkActionMode(false);
                  setSelectedIds(new Set());
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setBulkActionMode(true)}
                disabled={messages.length === 0}
              >
                Select Multiple
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGenerateNewDrafts}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate New
                  </>
                )}
              </Button>

              {safeItemsCount > 0 && (
                <Button 
                  variant="default" 
                  onClick={handleApproveAllSafe}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Approve {safeItemsCount} Safe
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold">{messages.length}</div>
          <div className="text-sm text-muted-foreground">Total in Queue</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-success">{safeItemsCount}</div>
          <div className="text-sm text-muted-foreground">Safe to Approve</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-warning">
            {messages.filter(item => (item.confidence || 0) < 0.8).length}
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
      ) : messages.length === 0 ? (
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
          {messages.map((msg) => {
            const contact = contacts[msg.contact_id];
            const clientName = contact 
              ? `${contact.first_name} ${contact.last_name}`.trim()
              : "Unknown Client";
            const isSelected = selectedIds.has(msg.id);
            
            return (
              <div key={msg.id} className="space-y-2">
                {msg.auto_approval_at && (
                  <AutoApprovalCountdown
                    messageId={msg.id}
                    autoApprovalAt={msg.auto_approval_at}
                    onCancel={loadQueue}
                  />
                )}
                <div 
                  className={`relative ${bulkActionMode ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-primary rounded-lg" : ""}`}
                  onClick={() => bulkActionMode && toggleSelect(msg.id)}
                >
                  {bulkActionMode && (
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(msg.id)}
                        className="h-5 w-5 rounded border-2 border-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <QueueCard
                    item={{
                      id: msg.id,
                      clientId: msg.contact_id,
                      clientName,
                      preview: msg.content,
                      confidence: msg.confidence || 0.8,
                      status: msg.status as any,
                      why: msg.why_reasons || [],
                      createdAt: msg.created_at,
                    }}
                    onApprove={() => !bulkActionMode && handleApprove(msg.id)}
                    onReject={() => !bulkActionMode && handleReject(msg.id)}
                    onEdit={() => !bulkActionMode && handleEdit(msg.id)}
                    onSendNow={() => !bulkActionMode && handleSendNow(msg.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Editor */}
      {editingItem && (
        <MessageEditor
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          queueItem={{
            id: editingItem.id,
            clientName: contacts[editingItem.contact_id]?.first_name || "Unknown",
            preview: editingItem.content,
            confidence: editingItem.confidence || 0.8,
            why: editingItem.why_reasons || [],
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
