import { trainers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Admin() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage trainer verification and system health.
        </p>
      </div>

      {/* Trainers Management */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Trainer Management</h3>
        <div className="space-y-2">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{trainer.name}</p>
                    {trainer.verified && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{trainer.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Verified</span>
                  <Switch defaultChecked={trainer.verified} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Visible</span>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Health */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold mb-4">Webhook Status</h3>
        <div className="space-y-3">
          {[
            { name: "GHL Calendar Sync", status: "healthy", lastEvent: "2 min ago" },
            { name: "Client Data Sync", status: "healthy", lastEvent: "5 min ago" },
            { name: "Payment Processing", status: "warning", lastEvent: "15 min ago" },
          ].map((webhook, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                {webhook.status === "healthy" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">{webhook.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Last event: {webhook.lastEvent}
                  </p>
                </div>
              </div>
              <Badge
                variant={webhook.status === "healthy" ? "default" : "secondary"}
              >
                {webhook.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
