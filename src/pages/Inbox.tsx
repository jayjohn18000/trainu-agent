import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Edit, X, Check, Mail, Clock, CheckCircle2 } from "lucide-react";
import { listInboxDrafts, updateInboxDraftStatus, generateSampleDrafts } from "@/lib/mock/api-extended";
import type { InboxDraft, InboxStatus } from "@/lib/mock/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { format } from "date-fns";
import { useGamification } from "@/hooks/useGamification";
import { XPNotification, LevelUpNotification } from "@/components/ui/XPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";

export default function Inbox() {
  const { user } = useAuthStore();
  const [drafts, setDrafts] = useState<InboxDraft[]>([]);
  const [editingDraft, setEditingDraft] = useState<InboxDraft | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { 
    grantXP, 
    xpNotification, 
    levelUpNotification, 
    achievementUnlock,
    clearXPNotification, 
    clearLevelUpNotification,
    clearAchievementUnlock
  } = useGamification();

  const isTrainerOrAdmin = user?.role === 'trainer' || user?.role === 'gym_admin';

  useEffect(() => {
    if (isTrainerOrAdmin) loadDrafts();
  }, [isTrainerOrAdmin]);

  const loadDrafts = async () => {
    const allDrafts = await listInboxDrafts();
    setDrafts(allDrafts);
  };

  const handleGenerateSamples = async () => {
    await generateSampleDrafts();
    loadDrafts();
    toast({
      title: "Sample drafts generated",
      description: "Review the AI-generated messages in your inbox"
    });
  };

  const handleApprove = async (draft: InboxDraft) => {
    await updateInboxDraftStatus(draft.id, 'scheduled');
    loadDrafts();
    toast({
      title: "Draft approved",
      description: "Message has been scheduled for delivery"
    });
  };

  const handleReject = async (draft: InboxDraft) => {
    await updateInboxDraftStatus(draft.id, 'rejected');
    loadDrafts();
    toast({
      title: "Draft rejected",
      description: "Message has been discarded"
    });
  };

  const handleSend = async (draft: InboxDraft) => {
    await updateInboxDraftStatus(draft.id, 'sent');
    loadDrafts();
    grantXP(15, "Client Message Sent");
    toast({
      title: "Message sent",
      description: "Sent via Go High Level"
    });
  };

  const handleEdit = (draft: InboxDraft) => {
    setEditingDraft(draft);
    setEditedContent(draft.fullContent);
  };

  const handleSaveEdit = async () => {
    if (editingDraft) {
      // In a real app, update the content
      setEditingDraft(null);
      toast({
        title: "Draft updated",
        description: "Your changes have been saved"
      });
    }
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: '🎉 Welcome',
      streak_protect: '🔥 Streak Protect',
      pre_session: '📅 Pre-Session',
      no_show_recovery: '⚠️ No-Show Recovery',
      milestone: '🏆 Milestone'
    };
    return labels[type] || type;
  };

  const renderDrafts = (status: InboxStatus) => {
    const filtered = drafts.filter(d => d.status === status);
    
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={Mail}
          title={`No ${status} messages`}
          description="AI-generated messages will appear here"
        />
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map(draft => (
          <Card key={draft.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getTriggerLabel(draft.triggerType)}
                  </Badge>
                  {draft.scheduledFor && (
                    <span className="text-sm text-muted-foreground">
                      Scheduled for {format(new Date(draft.scheduledFor), "MMM d, h:mm a")}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold">{draft.subject}</h3>
                <p className="text-sm text-muted-foreground">{draft.previewText}</p>
              </div>
              
              <div className="flex gap-2">
                {status === 'needs_review' && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(draft)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleReject(draft)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(draft)}>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
                {status === 'scheduled' && (
                  <Button size="sm" className="gap-2" onClick={() => handleSend(draft)}>
                    <Send className="h-4 w-4" />
                    Send via GHL
                  </Button>
                )}
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View full message
              </summary>
              <div className="mt-2 p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">
                {draft.fullContent}
              </div>
            </details>
          </Card>
        ))}
      </div>
    );
  };

  if (!isTrainerOrAdmin) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState
          icon={Mail}
          title="Access restricted"
          description="AI Inbox is only available for trainers and owners"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Inbox</h1>
          <p className="text-muted-foreground">Review and manage AI-generated client communications</p>
        </div>
        <Button variant="outline" onClick={handleGenerateSamples}>
          Generate Sample Drafts
        </Button>
      </div>

      <Tabs defaultValue="needs_review" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="needs_review" className="gap-2">
            <Clock className="h-4 w-4" />
            Needs Review ({drafts.filter(d => d.status === 'needs_review').length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Send className="h-4 w-4" />
            Scheduled ({drafts.filter(d => d.status === 'scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Sent ({drafts.filter(d => d.status === 'sent').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="needs_review">
          {renderDrafts('needs_review')}
        </TabsContent>

        <TabsContent value="scheduled">
          {renderDrafts('scheduled')}
        </TabsContent>

        <TabsContent value="sent">
          {renderDrafts('sent')}
        </TabsContent>
      </Tabs>

      {editingDraft && (
        <Dialog open={!!editingDraft} onOpenChange={() => setEditingDraft(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <p className="text-sm text-muted-foreground mt-1">{editingDraft.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Message Content</label>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={10}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingDraft(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <XPNotification 
        amount={xpNotification?.amount || 0}
        reason={xpNotification?.reason}
        show={!!xpNotification}
        onComplete={clearXPNotification}
      />
      
      <LevelUpNotification 
        level={levelUpNotification || 0}
        show={!!levelUpNotification}
        onComplete={clearLevelUpNotification}
      />

      <AchievementUnlockNotification
        achievement={achievementUnlock}
        show={!!achievementUnlock}
        onComplete={clearAchievementUnlock}
      />
    </div>
  );
}
