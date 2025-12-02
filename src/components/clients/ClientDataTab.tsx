import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // Fetch contact to check GHL sync status
  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch integration statuses
  const { data: ghlStatus } = useQuery({
    queryKey: ['integration-status', 'ghl'],
    queryFn: () => getIntegrationStatusByName('ghl'),
  });

  const handleRefresh = async (integrationName: IntegrationSource) => {
    try {
      await triggerManualSync(integrationName);
      toast.success(`${INTEGRATION_INFO[integrationName].displayName} sync triggered`);
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
    } catch (error) {
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const integrations: IntegrationSource[] = ['ghl', 'mindbody', 'trainerize'];

  if (contactLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading data sources...</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {integrations.map((integrationName) => {
        const info = INTEGRATION_INFO[integrationName];
        const isGHL = integrationName === 'ghl';
        const isConnected = isGHL ? ghlStatus?.connection_status === 'connected' : false;
        const hasData = isGHL ? !!contact?.ghl_contact_id : false;
        const isComingSoon = info.status === 'coming-soon';

        return (
          <Card key={integrationName} className={isComingSoon ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isComingSoon ? (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{info.displayName}</CardTitle>
                    <CardDescription>{isComingSoon ? 'Coming Soon' : info.description}</CardDescription>
                  </div>
                </div>
                {isConnected && !isComingSoon && (
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
              {isComingSoon ? (
                <p className="text-sm text-muted-foreground">
                  This integration is coming soon.
                </p>
              ) : isConnected ? (
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
                    {ghlStatus?.last_sync_at && (
                      <div>
                        <p className="text-muted-foreground">Last Checked</p>
                        <p className="font-medium">
                          {format(new Date(ghlStatus.last_sync_at), 'PPp')}
                        </p>
                      </div>
                    )}
                  </div>

                  {hasData && isGHL && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Data Summary</h4>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p>Contact synced from GoHighLevel</p>
                        <p className="text-xs">GHL ID: {contact?.ghl_contact_id}</p>
                      </div>
                    </div>
                  )}

                  {ghlStatus?.last_error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">Error Log</p>
                          <p className="text-xs text-destructive/80 mt-1">{ghlStatus.last_error}</p>
                          {ghlStatus.last_error_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(ghlStatus.last_error_at), 'PPp')}
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
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Not connected</p>
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
            </CardContent>
          </Card>
        );
      })}

      {/* Apple Health - Coming Soon */}
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
