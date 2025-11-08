import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClientDetail } from "@/lib/data/clients/types";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageSquare,
  Tag,
  FileText,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  Target,
} from "lucide-react";
import { TagPicker } from "./TagPicker";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { useDraftsStore } from "@/lib/store/useDraftsStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { TemplateEditor } from "./TemplateEditor";
import { createDraftMessage, type Message } from "@/lib/api/messages";
import { createEvent, createOrUpdateInsight } from "@/lib/api/events";
import { createNote, listNotes, type Note } from "@/lib/api/notes";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientDetail | null;
  loading?: boolean;
  onUpdateTags: (tags: string[]) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
}

export function ClientInspector({
  open,
  onOpenChange,
  client,
  loading,
  onUpdateTags,
  onAddNote,
}: ClientInspectorProps) {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [dbMessages, setDbMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const { addFromQuickAction } = useDraftsStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMessages = useCallback(async (contactId: string) => {
    setMessagesLoading(true);
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      setDbMessages(data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Fetch messages and notes from database
  useEffect(() => {
    if (client?.id) {
      fetchMessages(client.id);
      fetchNotes(client.id);
    }
  }, [client?.id, fetchMessages]);

  const fetchNotes = useCallback(async (contactId: string) => {
    setNotesLoading(true);
    try {
      const data = await listNotes(contactId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  // Realtime subscription for messages
  useEffect(() => {
    if (!client?.id) return;

    const channel = supabase
      .channel(`messages:${client.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `contact_id=eq.${client.id}`,
        },
        () => {
          fetchMessages(client.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client?.id, fetchMessages]);

  const handleSaveTemplate = async (content: string) => {
    if (!client?.id) return;

    // Create optimistic temporary message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      trainer_id: '',
      contact_id: client.id,
      status: 'draft',
      content,
      channel: 'sms',
      confidence: null,
      why_reasons: null,
      scheduled_for: null,
      created_at: new Date().toISOString(),
    };

    // Add to messages list with syncing flag
    setDbMessages((prev) => [optimisticMessage, ...prev]);
    setSyncingIds((prev) => new Set(prev).add(tempId));

    try {
      // Save to database
      const { id } = await createDraftMessage(client.id, content, 'sms');
      
      // Replace optimistic message with real data
      setDbMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId 
            ? { ...optimisticMessage, id } 
            : msg
        )
      );

      // Remove from syncing set
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

      toast({
        title: "Template saved",
        description: "Draft created and added to queue.",
      });
    } catch (error) {
      // Remove optimistic message on error
      setDbMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (!client) return null;

  const riskColor =
    client.risk <= 33
      ? "text-green-600"
      : client.risk <= 66
      ? "text-amber-600"
      : "text-red-600";

  const handleSaveNote = async () => {
    if (!newNote.trim() || newNote.length > 500 || !client) return;
    setSavingNote(true);
    try {
      const note = await createNote(client.id, newNote);
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
      toast({
        title: "Note saved",
        description: "Note added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="client-inspector"
        className="w-full sm:max-w-xl overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatarUrl} alt={client.name} />
              <AvatarFallback>
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-2xl">{client.name}</SheetTitle>
              <SheetDescription className="space-y-1 mt-1">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!user || !client) return;
                try {
                  const messageContent = `Hey ${client.name.split(' ')[0]}, quick check-in — how did your last workout go?`;
                  
                  // 1. Create event
                  await createEvent({
                    trainer_id: user.id,
                    event_type: 'check_in',
                    entity_type: 'contact',
                    entity_id: client.id,
                    metadata: { action: 'check_in' },
                  });

                  // 2. Create/update insight
                  await createOrUpdateInsight({
                    trainer_id: user.id,
                    contact_id: client.id,
                    risk_score: Math.max(0, client.risk - 5), // Slight improvement
                    last_activity_at: new Date().toISOString(),
                  });

                  // 3. Create draft
                  const { id: draftId } = await createDraftMessage(client.id, messageContent, 'sms');

                  toast({ 
                    title: "Check-in created", 
                    description: "Redirecting to queue...",
                  });
                  
                  // Redirect to queue
                  navigate('/queue');
                } catch (e) {
                  toast({ title: "Error", description: "Failed to create check-in.", variant: "destructive" });
                }
              }}
            >
              Check-in
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!user || !client) return;
                try {
                  const messageContent = `Hey ${client.name.split(' ')[0]}, missed you last time. Everything okay? I can help you get back on track — want to pick a new time?`;
                  
                  // 1. Create event
                  await createEvent({
                    trainer_id: user.id,
                    event_type: 'recover_no_show',
                    entity_type: 'contact',
                    entity_id: client.id,
                    metadata: { action: 'recover_no_show' },
                  });

                  // 2. Create/update insight (increase risk for no-show)
                  await createOrUpdateInsight({
                    trainer_id: user.id,
                    contact_id: client.id,
                    risk_score: Math.min(100, client.risk + 10),
                    last_activity_at: new Date().toISOString(),
                  });

                  // 3. Create draft
                  await createDraftMessage(client.id, messageContent, 'sms');

                  toast({ 
                    title: "Recover no-show created", 
                    description: "Redirecting to queue...",
                  });
                  
                  // Redirect to queue
                  navigate('/queue');
                } catch (e) {
                  toast({ title: "Error", description: "Failed to create recover message.", variant: "destructive" });
                }
              }}
            >
              Recover no-show
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!user || !client) return;
                try {
                  const when = client.nextSession ? new Date(client.nextSession) : null;
                  const whenStr = when ? when.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'your next session';
                  const messageContent = `Hi ${client.name.split(' ')[0]}, can you confirm ${whenStr}? Reply YES to confirm or NO to reschedule.`;
                  
                  // 1. Create event
                  await createEvent({
                    trainer_id: user.id,
                    event_type: 'confirm_session',
                    entity_type: 'contact',
                    entity_id: client.id,
                    metadata: { action: 'confirm', session_time: when?.toISOString() },
                  });

                  // 2. Create/update insight
                  await createOrUpdateInsight({
                    trainer_id: user.id,
                    contact_id: client.id,
                    risk_score: Math.max(0, client.risk - 3),
                    last_activity_at: new Date().toISOString(),
                  });

                  // 3. Create draft
                  await createDraftMessage(client.id, messageContent, 'sms');

                  toast({ 
                    title: "Confirm message created", 
                    description: "Redirecting to queue...",
                  });
                  
                  // Redirect to queue
                  navigate('/queue');
                } catch (e) {
                  toast({ title: "Error", description: "Failed to create confirm message.", variant: "destructive" });
                }
              }}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              className="shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all"
            >
              Custom Recommendation
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Risk & Metrics */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Client Health
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className={`text-2xl font-bold ${riskColor}`}>{client.risk}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold">{client.metrics.streakDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Workouts (7d)</p>
                    <p className="text-2xl font-bold">{client.metrics.workouts7d}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-2xl font-bold">{client.metrics.responseRate30d}%</p>
                  </div>
                </div>
              </Card>

              {/* Status & Program */}
              <Card className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge>{client.status}</Badge>
                </div>
                {client.program && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Program</p>
                    <p className="font-medium">{client.program}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Activity</p>
                  <p>
                    {formatDistanceToNow(new Date(client.lastActivity), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {client.nextSession && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next Session</p>
                    <p>
                      {formatDistanceToNow(new Date(client.nextSession), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}
              </Card>

              {/* Goals */}
              {client.goals && client.goals.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Goals
                  </h3>
                  <ul className="space-y-2">
                    {client.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Tags */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTags(!isEditingTags)}
                  >
                    {isEditingTags ? "Done" : "Edit"}
                  </Button>
                </div>
                {isEditingTags ? (
                  <TagPicker tags={client.tags} onChange={onUpdateTags} />
                ) : (
                  <div className="flex gap-1 flex-wrap">
                    {client.tags.length > 0 ? (
                      client.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags yet</p>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-3 mt-4">
              {client.sessions.length > 0 ? (
                client.sessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{session.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.time), "PPp")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          session.status === "upcoming"
                            ? "default"
                            : session.status === "done"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No sessions scheduled
                </p>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setTemplateEditorOpen(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>

              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : dbMessages.length > 0 ? (
                dbMessages.map((message) => (
                  <Card key={message.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              message.status === 'draft'
                                ? 'secondary'
                                : message.status === 'queued'
                                ? 'default'
                                : message.status === 'sent'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {message.status}
                          </Badge>
                          {syncingIds.has(message.id) && (
                            <Badge variant="outline" className="animate-pulse">
                              syncing...
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Create a template to get started.
                </p>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Add Note
                </h3>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write a note about this client..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        newNote.length > 500
                          ? "text-red-600"
                          : newNote.length >= 450
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {newNote.length}/500
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSaveNote}
                    disabled={!newNote.trim() || newNote.length > 500 || savingNote}
                  >
                    {savingNote ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </Card>

              {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Previous Notes</h3>
                  {notes.map((note) => (
                    <Card key={note.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Added by {user?.email?.split('@')[0] || 'Trainer'}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No notes yet. Add your first note above.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      {/* Template Editor */}
      <TemplateEditor
        clientId={client.id}
        clientName={client.name}
        open={templateEditorOpen}
        onOpenChange={setTemplateEditorOpen}
        onSave={handleSaveTemplate}
      />
    </Sheet>
  );
}
