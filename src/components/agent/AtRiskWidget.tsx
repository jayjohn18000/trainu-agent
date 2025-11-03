import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useAtRiskClients } from "@/hooks/queries/useAtRiskClients";
import type { AtRiskClient } from "@/hooks/queries/useAtRiskClients";

export function AtRiskWidget() {
  const { data: atRiskClients = [], isLoading } = useAtRiskClients();

  const handleNudge = (client: AtRiskClient) => {
    toast({
      title: "Nudge sent",
      description: `Re-engagement message sent to ${client.name}`,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-warning/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            At-Risk Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-border">
              <div className="flex items-start gap-3 mb-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-7 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (atRiskClients.length === 0) {
    return (
      <Card className="border-warning/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            At-Risk Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No at-risk clients - great job! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          At-Risk Clients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {atRiskClients.map((client) => (
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
