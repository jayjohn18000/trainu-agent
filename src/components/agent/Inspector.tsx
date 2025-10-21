import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, Activity, CreditCard, FileText } from "lucide-react";
import type { Client } from "@/types/agent";

interface InspectorProps {
  client: Client;
  onNudge?: () => void;
  onBook?: () => void;
}

export function Inspector({ client, onNudge, onBook }: InspectorProps) {
  return (
    <div className="space-y-4">
      {/* Header with quick actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{client.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    client.risk >= 70
                      ? "destructive"
                      : client.risk >= 40
                      ? "secondary"
                      : "default"
                  }
                >
                  Risk: {client.risk}
                </Badge>
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onNudge}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Nudge
            </Button>
            <Button size="sm" variant="outline" onClick={onBook}>
              <Calendar className="h-4 w-4 mr-2" />
              Book (GHL)
            </Button>
            <Button size="sm" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Check-in
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Waiver
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed info */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Last seen: {client.lastSeen}</p>
                <p>Next action: {client.nextAction}</p>
                <div className="pt-2 border-t">
                  <p className="font-medium text-foreground mb-1">AI Insight</p>
                  <p>{client.aiInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                No programs assigned yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                No progress data available
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                No billing information
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                No notes yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
