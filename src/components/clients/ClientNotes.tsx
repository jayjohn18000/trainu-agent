import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Calendar, User } from "lucide-react";

type Props = {
  clientId: string;
};

const existingNotes = [
  {
    id: "n1",
    date: "2025-10-02",
    author: "Coach Mike",
    content: "Client showed great progress on squats today. Increased weight by 10lbs and maintained good form throughout all sets.",
  },
  {
    id: "n2",
    date: "2025-09-30",
    author: "Coach Mike",
    content: "Discussed nutrition goals. Client committed to tracking macros for the next 2 weeks.",
  },
  {
    id: "n3",
    date: "2025-09-27",
    author: "Coach Mike",
    content: "Need to focus on shoulder mobility exercises. Client experiencing some tightness during overhead press.",
  },
];

export function ClientNotes({ clientId }: Props) {
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast({
        title: "Note Added",
        description: "Your note has been saved successfully",
      });
      setNewNote("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-note">Add New Note</Label>
            <Textarea
              id="new-note"
              placeholder="Add observations, goals, or important information about this client..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>
          <Button onClick={handleAddNote} disabled={!newNote.trim()}>
            Save Note
          </Button>
        </div>
      </Card>

      {/* Existing Notes */}
      <div>
        <h3 className="font-semibold mb-4">Previous Notes</h3>
        <div className="space-y-3">
          {existingNotes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{note.date}</span>
                  <span>•</span>
                  <User className="h-3 w-3" />
                  <span>{note.author}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{note.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
