import { DataSourcePanel } from "./DataSourcePanel";
import { Database, MessageSquare, Smartphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DataTabProps {
  ghlLastSync?: string;
  ghlConnected?: boolean;
  messageCount?: number;
}

export function DataTab({ 
  ghlLastSync, 
  ghlConnected = false,
  messageCount = 0,
}: DataTabProps) {
  return (
    <div className="space-y-4">
      <DataSourcePanel
        name="GoHighLevel"
        status={ghlConnected ? 'connected' : 'disconnected'}
        lastSync={ghlLastSync ? formatDistanceToNow(new Date(ghlLastSync), { addSuffix: true }) : undefined}
        icon={<Database className="h-5 w-5 text-primary" />}
        activityCount={messageCount}
      />
      
      <DataSourcePanel
        name="TrainU Messages"
        status="connected"
        icon={<MessageSquare className="h-5 w-5 text-primary" />}
        activityCount={messageCount}
        lastSync="just now"
      />

      <DataSourcePanel
        name="Trainerize"
        status="disconnected"
        icon={<Smartphone className="h-5 w-5 text-muted-foreground" />}
      />
    </div>
  );
}
