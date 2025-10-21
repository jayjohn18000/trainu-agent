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
import { useState } from "react";

interface ClientInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientDetail | null;
  loading?: boolean;
  onNudge: () => void;
  onUpdateTags: (tags: string[]) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
}

export function ClientInspector({
  open,
  onOpenChange,
  client,
  loading,
  onNudge,
  onUpdateTags,
  onAddNote,
}: ClientInspectorProps) {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  if (!client) return null;

  const riskColor =
    client.risk <= 33
      ? "text-green-600"
      : client.risk <= 66
      ? "text-amber-600"
      : "text-red-600";

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      await onAddNote(newNote);
      setNewNote("");
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
          <div className="flex gap-2">
            <Button onClick={onNudge} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Nudge
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
              {client.messages.length > 0 ? (
                client.messages.map((message) => (
                  <Card key={message.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          message.direction === "in"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{message.preview}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.time), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet
                </p>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Add Note
                </h3>
                <Textarea
                  placeholder="Write a note about this client..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  className="mt-3 w-full"
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || savingNote}
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </Button>
              </Card>

              {client.notes && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Current Notes</h3>
                  <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
