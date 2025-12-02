import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database, Smartphone, Zap, Heart, Watch, Activity } from "lucide-react";

export default function Integrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ghlConnected, setGhlConnected] = useState(false);
  const [ghlLastSync, setGhlLastSync] = useState<string>();

  // Check GHL connection status
  useState(() => {
    const checkGHL = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: config } = await supabase
        .from('ghl_config')
        .select('access_token, updated_at')
        .eq('trainer_id', user.id)
        .single();
      
      setGhlConnected(!!config?.access_token);
      setGhlLastSync(config?.updated_at || undefined);
    };
    checkGHL();
  });

  const handleConnectGHL = () => {
    navigate('/settings');
    toast({
      title: "Opening settings",
      description: "Connect GoHighLevel in the integrations section.",
    });
  };

  const handleConfigureGHL = () => {
    navigate('/settings');
  };

  const handleDisconnectGHL = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('ghl_config')
      .update({ access_token: null, refresh_token: null })
      .eq('trainer_id', user.id);
    
    setGhlConnected(false);
    toast({
      title: "Disconnected",
      description: "GoHighLevel has been disconnected.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your favorite tools to sync client data and streamline your workflow.
        </p>
      </div>

      <Tabs defaultValue="connected" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4 mt-6">
          {ghlConnected ? (
            <IntegrationCard
              name="GoHighLevel"
              description="Sync contacts, messages, and appointments with your GHL account."
              icon={<Database className="h-6 w-6 text-primary" />}
              status="connected"
              lastSync={ghlLastSync ? new Date(ghlLastSync).toLocaleString() : undefined}
              onConfigure={handleConfigureGHL}
              onDisconnect={handleDisconnectGHL}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No integrations connected yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4 mt-6">
          {!ghlConnected && (
            <IntegrationCard
              name="GoHighLevel"
              description="Sync contacts, messages, and appointments with your GHL account."
              icon={<Database className="h-6 w-6 text-muted-foreground" />}
              status="disconnected"
              onConnect={handleConnectGHL}
            />
          )}
          <IntegrationCard
            name="Mindbody"
            description="Sync client schedules and attendance data from Mindbody."
            icon={<Smartphone className="h-6 w-6 text-muted-foreground" />}
            status="disconnected"
          />
          <IntegrationCard
            name="Trainerize"
            description="Pull workout completion data and client progress."
            icon={<Zap className="h-6 w-6 text-muted-foreground" />}
            status="disconnected"
          />
          <IntegrationCard
            name="TrueCoach"
            description="Sync training programs and client performance metrics."
            icon={<Activity className="h-6 w-6 text-muted-foreground" />}
            status="disconnected"
          />
        </TabsContent>

        <TabsContent value="coming-soon" className="space-y-4 mt-6">
          <IntegrationCard
            name="Apple Health"
            description="Import health metrics, workouts, and activity data from Apple Health."
            icon={<Heart className="h-6 w-6 text-warning" />}
            status="coming_soon"
          />
          <IntegrationCard
            name="Oura Ring"
            description="Track sleep, recovery, and readiness scores for better programming."
            icon={<Watch className="h-6 w-6 text-warning" />}
            status="coming_soon"
          />
          <IntegrationCard
            name="Fitbit"
            description="Monitor daily activity, heart rate, and exercise data."
            icon={<Activity className="h-6 w-6 text-warning" />}
            status="coming_soon"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
