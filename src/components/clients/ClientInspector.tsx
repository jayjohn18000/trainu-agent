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
import { Textarea } from "@/components/ui/textarea";
import { ClientDetail } from "@/lib/data/clients/types";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageSquare,
  Tag,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  Target,
  ExternalLink,
  Smartphone,
  Instagram,
  Facebook,
  MessageCircle,
  Trophy,
  FileText,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useDraftsStore } from "@/lib/store/useDraftsStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { TemplateEditor } from "./TemplateEditor";
import { createDraftMessage, type Message, type MessageChannel } from "@/lib/api/messages";
import { createEvent, createOrUpdateInsight } from "@/lib/api/events";
import { createNote, listNotes, deleteNote, type Note, type NoteType } from "@/lib/api/notes";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { resolveGhlLink } from "@/lib/ghl/links";
import { ProgramsTab } from "./ProgramsTab";
import { DataTab } from "./DataTab";

interface ClientInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientDetail | null;
  loading?: boolean;
}

// Channel icon and label mapping
const channelConfig: Record<MessageChannel, { icon: React.ReactNode; label: string; color: string }> = {
  sms: { icon: <Smartphone className="h-3 w-3" />, label: 'SMS', color: 'bg-blue-500/10 text-blue-600' },
  email: { icon: <Mail className="h-3 w-3" />, label: 'Email', color: 'bg-purple-500/10 text-purple-600' },
  both: { icon: <MessageSquare className="h-3 w-3" />, label: 'Multi', color: 'bg-gray-500/10 text-gray-600' },
  instagram: { icon: <Instagram className="h-3 w-3" />, label: 'Instagram', color: 'bg-pink-500/10 text-pink-600' },
  facebook: { icon: <Facebook className="h-3 w-3" />, label: 'Facebook', color: 'bg-blue-600/10 text-blue-700' },
  whatsapp: { icon: <MessageCircle className="h-3 w-3" />, label: 'WhatsApp', color: 'bg-green-500/10 text-green-600' },
  dm: { icon: <MessageSquare className="h-3 w-3" />, label: 'DM', color: 'bg-indigo-500/10 text-indigo-600' },
};

// Note type config
const noteTypeConfig: Record<NoteType, { icon: React.ReactNode; label: string; color: string }> = {
  goal: { icon: <Target className="h-4 w-4" />, label: 'Goal', color: 'bg-primary/10 text-primary' },
  milestone: { icon: <Trophy className="h-4 w-4" />, label: 'Milestone', color: 'bg-amber-500/10 text-amber-600' },
  quick_note: { icon: <FileText className="h-4 w-4" />, label: 'Note', color: 'bg-muted text-muted-foreground' },
};

export function ClientInspector({
  open,
  onOpenChange,
  client,
  loading,
}: ClientInspectorProps) {
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [dbMessages, setDbMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>('quick_note');
  const [savingNote, setSavingNote] = useState(false);
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
      setDbMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

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

  // Fetch messages and notes from database
  useEffect(() => {
    if (client?.id) {
      fetchMessages(client.id);
      fetchNotes(client.id);
    }
  }, [client?.id, fetchMessages, fetchNotes]);

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

  const handleSaveNote = async () => {
    if (!client?.id || !newNoteContent.trim()) {
      console.log('[handleSaveNote] Missing client or content');
      return;
    }
    
    setSavingNote(true);
    try {
      console.log('[handleSaveNote] Saving note for client:', client.id);
      const note = await createNote(client.id, newNoteContent, selectedNoteType);
      setNotes(prev => [note, ...prev]);
      setNewNoteContent('');
      setSelectedNoteType('quick_note');
      toast({
        title: "Note saved",
        description: `${noteTypeConfig[selectedNoteType].label} added successfully.`,
      });
    } catch (error) {
      console.error('[handleSaveNote] Error:', error);
      const message = error instanceof Error ? error.message : "Failed to save note.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast({
        title: "Note deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async (content: string) => {
    if (!client?.id) return;

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

    setDbMessages((prev) => [optimisticMessage, ...prev]);
    setSyncingIds((prev) => new Set(prev).add(tempId));

    try {
      const { id } = await createDraftMessage(client.id, content, 'sms');
      
      setDbMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId 
            ? { ...optimisticMessage, id } 
            : msg
        )
      );

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

  const handleEditInGHL = async () => {
    if (!client) return;
    
    const result = await resolveGhlLink({
      type: 'conversations',
      ids: { contactId: client.id },
    });
    
    if (result.disabled) {
      toast({
        title: "Cannot open GHL",
        description: result.reason || "Missing GHL configuration",
        variant: "destructive",
      });
      return;
    }
    
    if (result.url) {
      window.open(result.url, '_blank');
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
          
          <Button 
            onClick={handleEditInGHL} 
            className="w-full mt-4 gap-2"
            variant="default"
          >
            <ExternalLink className="h-4 w-4" />
            Edit Contact in GHL
          </Button>
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
                  
                  await createEvent({
                    trainer_id: user.id,
                    event_type: 'check_in',
                    entity_type: 'contact',
                    entity_id: client.id,
                    metadata: { action: 'check_in' },
                  });

                  await createOrUpdateInsight({
                    trainer_id: user.id,
                    contact_id: client.id,
                    risk_score: Math.max(0, client.risk - 5),
                    last_activity_at: new Date().toISOString(),
                  });

                  await createDraftMessage(client.id, messageContent, 'sms');

                  toast({ 
                    title: "Check-in created", 
                    description: "Redirecting to queue...",
                  });
                  
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
                  
                  await createEvent({
                    trainer_id: user.id,
                    event_type: 'recover_no_show',
                    entity_type: 'contact',
                    entity_id: client.id,
                    metadata: { action: 'recover_no_show' },
                  });

                  await createOrUpdateInsight({
                    trainer_id: user.id,
                    contact_id: client.id,
                    risk_score: Math.min(100, client.risk + 10),
                    last_activity_at: new Date().toISOString(),
                  });

                  await createDraftMessage(client.id, messageContent, 'sms');

                  toast({ 
                    title: "Recover no-show created", 
                    description: "Redirecting to queue...",
                  });
                  
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
                  
                  await createEvent({
                    trainer_id: user.id,
                    event_type: 'confirm_session',
                    entity_type: 'contact',
                    entity_id: client.id,
                    metadata: { action: 'confirm', session_time: when?.toISOString() },
                  });

                  await createOrUpdateInsight({
                    trainer_id: user.id,
                    contact_id: client.id,
                    risk_score: Math.max(0, client.risk - 3),
                    last_activity_at: new Date().toISOString(),
                  });

                  await createDraftMessage(client.id, messageContent, 'sms');

                  toast({ 
                    title: "Confirm message created", 
                    description: "Redirecting to queue...",
                  });
                  
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
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

              {/* Tags - Read Only */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex gap-1 flex-wrap">
                  {client.tags.length > 0 ? (
                    client.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags assigned</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Edit tags in GHL to sync changes
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="programs" className="space-y-3 mt-4">
              <ProgramsTab
                programName={client.program || undefined}
                programDuration={client.programDuration}
                sessionsCompleted={client.programSessionsCompleted}
                totalSessions={client.programTotalSessions}
                compliance={client.metrics?.responseRate30d}
              />
            </TabsContent>

            <TabsContent value="data" className="space-y-3 mt-4">
              <DataTab
                ghlConnected={!!client.ghlContactId}
                messageCount={dbMessages.length}
              />
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
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  Message history synced from GHL. Channel badges show where each message originated.
                </p>
              </div>

              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : dbMessages.length > 0 ? (
                dbMessages.map((message) => {
                  const channel = channelConfig[message.channel] || channelConfig.sms;
                  return (
                    <Card key={message.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${channel.color}`}>
                          {channel.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {/* Channel Badge */}
                            <Badge variant="outline" className={`text-xs ${channel.color} border-0`}>
                              {channel.icon}
                              <span className="ml-1">{channel.label}</span>
                            </Badge>
                            {/* Status Badge */}
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
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Create a template to get started.
                </p>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              {/* Add Note Form */}
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Note
                </h3>
                <Textarea
                  placeholder="Enter note content..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {(Object.keys(noteTypeConfig) as NoteType[]).map((type) => {
                      const config = noteTypeConfig[type];
                      return (
                        <Button
                          key={type}
                          variant={selectedNoteType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedNoteType(type)}
                          className="gap-1"
                        >
                          {config.icon}
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {newNoteContent.length}/500
                  </span>
                </div>
                <Button 
                  onClick={handleSaveNote} 
                  disabled={!newNoteContent.trim() || savingNote}
                  className="w-full"
                >
                  {savingNote ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Note'
                  )}
                </Button>
              </Card>

              {/* Notes List */}
              {notesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Previous Notes</h3>
                  {notes.map((note) => {
                    const config = noteTypeConfig[note.note_type] || noteTypeConfig.quick_note;
                    return (
                      <Card key={note.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className={`${config.color} border-0`}>
                            {config.icon}
                            <span className="ml-1">{config.label}</span>
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      </Card>
                    );
                  })}
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
    </Sheet>
  );
}
