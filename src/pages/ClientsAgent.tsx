import { fixtures } from "@/lib/fixtures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ClientsAgent() {
  const clients = fixtures.clients;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Clients</h1>

      <div className="grid gap-4">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No clients found
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{client.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last seen: {client.lastSeen}
                    </p>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">AI Insight</div>
                    <p className="text-sm text-muted-foreground">{client.aiInsight}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Next Action</div>
                    <p className="text-sm text-muted-foreground">{client.nextAction}</p>
                  </div>
                  <div className="flex gap-2">
                    {client.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      Nudge
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
