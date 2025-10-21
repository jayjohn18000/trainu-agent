import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface AtRiskClient {
  id: string;
  name: string;
  avatar?: string;
  risk: number;
  lastActivity: string;
  reason: string;
}

const mockAtRiskClients: AtRiskClient[] = [
  {
    id: "1",
    name: "Emma Thompson",
    avatar: "https://i.pravatar.cc/150?img=5",
    risk: 92,
    lastActivity: "14 days ago",
    reason: "No check-ins for 14 days",
  },
  {
    id: "2",
    name: "Sarah Martinez",
    avatar: "https://i.pravatar.cc/150?img=1",
    risk: 85,
    lastActivity: "6 days ago",
    reason: "2 missed sessions",
  },
  {
    id: "3",
    name: "Tom Brown",
    avatar: "https://i.pravatar.cc/150?img=10",
    risk: 78,
    lastActivity: "10 days ago",
    reason: "Never responds to messages",
  },
];

export function AtRiskWidget() {
  const handleNudge = (client: AtRiskClient) => {
    toast({
      title: "Nudge sent",
      description: `Re-engagement message sent to ${client.name}`,
    });
  };

  return (
    <Card className="border-warning/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          At-Risk Clients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAtRiskClients.map((client) => (
          <div
            key={client.id}
            className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={client.avatar} />
                <AvatarFallback>{client.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{client.name}</p>
                  <Badge 
                    variant="destructive" 
                    className="h-4 px-1.5 text-[10px]"
                  >
                    {client.risk}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{client.reason}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last seen: {client.lastActivity}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={() => handleNudge(client)}
            >
              <Send className="h-3 w-3 mr-1" />
              Send Nudge
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
