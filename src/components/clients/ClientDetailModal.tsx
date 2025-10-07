import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SessionHistory } from "./SessionHistory";
import { ClientNotes } from "./ClientNotes";
import { ProgramAssignment } from "./ProgramAssignment";
import { ClientProgressChart } from "./ClientProgressChart";

type Client = {
  id: string;
  name: string;
  avatar: string;
  program: string;
  lastSession: string;
  nextSession: string | null;
  progress: number;
  status: string;
  email?: string;
  phone?: string;
  joinDate?: string;
};

type Props = {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientDetailModal({ client, open, onOpenChange }: Props) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status === "at_risk" ? "At Risk" : "Active"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Member since {client.joinDate || "Jan 2025"}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="program">Program</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client.email || "john.doe@example.com"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{client.phone || "+1 (555) 123-4567"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Program</p>
                <p className="font-medium">{client.program}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{client.progress}%</p>
              </div>
            </div>

            <ClientProgressChart clientId={client.id} />
          </TabsContent>

          <TabsContent value="program">
            <ProgramAssignment clientId={client.id} currentProgram={client.program} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionHistory clientId={client.id} />
          </TabsContent>

          <TabsContent value="notes">
            <ClientNotes clientId={client.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
