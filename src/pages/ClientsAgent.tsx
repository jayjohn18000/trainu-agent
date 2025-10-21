import { useState } from "react";
import { fixtures } from "@/lib/fixtures";
import { Inspector } from "@/components/agent/Inspector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { nudgeClient } from "@/lib/api/agent";
import { Search } from "lucide-react";
import type { Client } from "@/types/agent";

export default function ClientsAgent() {
  const [clients] = useState(fixtures.clients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNudge = async (clientId: string, clientName: string) => {
    try {
      await nudgeClient(clientId);
      toast({
        title: "Nudge sent",
        description: `Message queued for ${clientName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send nudge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBook = () => {
    toast({
      title: "Opening GHL",
      description: "Redirecting to booking system...",
    });
    // TODO: Add GHL link
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No clients found" : "No clients yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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
                    <p className="text-sm text-muted-foreground">
                      {client.aiInsight}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Next Action</div>
                    <p className="text-sm text-muted-foreground">
                      {client.nextAction}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {client.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNudge(client.id, client.name);
                      }}
                    >
                      Nudge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inspector Sheet */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle>Client Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Inspector
                  client={selectedClient}
                  onNudge={() => handleNudge(selectedClient.id, selectedClient.name)}
                  onBook={handleBook}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
