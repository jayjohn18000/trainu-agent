import { format } from "date-fns";
import type { IntegrationActivityLog } from "@/lib/api/integrations";

interface IntegrationActivityLogProps {
  logs: IntegrationActivityLog[];
}

export function IntegrationActivityLog({ logs }: IntegrationActivityLogProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No recent activity</p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="text-xs font-mono bg-muted/50 p-2 rounded border border-border"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="text-muted-foreground">
                {format(new Date(log.created_at), 'HH:mm:ss')}
              </span>
              <span className="ml-2 text-foreground">{log.activity_message}</span>
            </div>
          </div>
          {log.activity_data && Object.keys(log.activity_data).length > 0 && (
            <details className="mt-1">
              <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                View details
              </summary>
              <pre className="mt-1 text-xs overflow-x-auto">
                {JSON.stringify(log.activity_data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

