import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { getIntegrationStatusByName, triggerManualSync } from "@/lib/api/integrations";
import { INTEGRATION_INFO, type IntegrationSource } from "@/types/integrations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ClientDataTabProps {
  contactId: string;
}

export function ClientDataTab({ contactId }: ClientDataTabProps) {
  const queryClient = useQueryClient();

  // Fetch contact sources for this client
  const { data: contactSources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ['contact-sources', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_sources')
        .select('*')
        .eq('contact_id', contactId)
        .order('source');

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch integration statuses
  const { data: ghlStatus } = useQuery({
    queryKey: ['integration-status', 'ghl'],
    queryFn: () => getIntegrationStatusByName('ghl'),
  });

  const { data: mindbodyStatus } = useQuery({
    queryKey: ['integration-status', 'mindbody'],
    queryFn: () => getIntegrationStatusByName('mindbody'),
  });

  const { data: trainerizeStatus } = useQuery({
    queryKey: ['integration-status', 'trainerize'],
    queryFn: () => getIntegrationStatusByName('trainerize'),
  });

  const statusMap = new Map([
    ['ghl', ghlStatus],
    ['mindbody', mindbodyStatus],
    ['trainerize', trainerizeStatus],
  ]);

  const handleRefresh = async (integrationName: IntegrationSource) => {
    try {
      await triggerManualSync(integrationName);
      toast.success(`${INTEGRATION_INFO[integrationName].displayName} sync triggered`);
      queryClient.invalidateQueries({ queryKey: ['contact-sources', contactId] });
    } catch (error) {
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const integrations: IntegrationSource[] = ['ghl', 'mindbody', 'trainerize'];

  if (sourcesLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading data sources...</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {integrations.map((integrationName) => {
        const info = INTEGRATION_INFO[integrationName];
        const status = statusMap.get(integrationName);
        const sourceData = contactSources.find(s => s.source === integrationName);
        const isConnected = status?.connection_status === 'connected';
        const hasData = !!sourceData;

        return (
          <Card key={integrationName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{info.displayName}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </div>
                </div>
                {isConnected && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefresh(integrationName)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {hasData ? (
                          <span className="text-green-500">Syncing ✓</span>
                        ) : (
                          <span className="text-muted-foreground">No data yet</span>
                        )}
                      </p>
                    </div>
                    {status?.last_sync_at && (
                      <div>
                        <p className="text-muted-foreground">Last Checked</p>
                        <p className="font-medium">
                          {format(new Date(status.last_sync_at), 'PPp')}
                        </p>
                      </div>
                    )}
                  </div>

                  {hasData && sourceData.source_data && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Data Summary</h4>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        {integrationName === 'mindbody' && (
                          <>
                            {sourceData.source_data.status && (
                              <p>Status: <span className="text-foreground">{sourceData.source_data.status}</span></p>
                            )}
                            {sourceData.source_data.membershipName && (
                              <p>Membership: <span className="text-foreground">{sourceData.source_data.membershipName}</span></p>
                            )}
                          </>
                        )}
                        {integrationName === 'ghl' && (
                          <p>Contact synced from GoHighLevel</p>
                        )}
                        {integrationName === 'trainerize' && (
                          <p>Program data available</p>
                        )}
                      </div>
                    </div>
                  )}

                  {status?.last_error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">Error Log</p>
                          <p className="text-xs text-destructive/80 mt-1">{status.last_error}</p>
                          {status.last_error_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(status.last_error_at), 'PPp')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!hasData && (
                    <div className="text-sm text-muted-foreground">
                      No data available from this source yet. Data will appear after the next sync.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {info.status === 'coming-soon' ? (
                    <p>This integration is coming soon.</p>
                  ) : (
                    <div className="space-y-2">
                      <p>Not connected</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = '/integrations'}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect {info.displayName}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Coming Soon Integrations */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Apple Health</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Health and fitness data from Apple devices will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

