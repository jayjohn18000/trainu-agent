import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, ExternalLink, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
  const [ghlUrl, setGhlUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchGhlConfig();
    }
  }, [open]);

  const fetchGhlConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Fetch GHL config for this trainer
      const { data, error: fetchError } = await supabase
        .from('ghl_config')
        .select('booking_widget_id, location_id')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data?.booking_widget_id) {
        // Correct GHL calendar widget URL format
        setGhlUrl(`https://api.leadconnectorhq.com/widget/booking/${data.booking_widget_id}`);
      } else if (data?.location_id) {
        // Have location but no calendar widget - calendar may not be set up
        setError('No calendar configured. Please set up your calendar in GHL.');
      } else {
        setError('Connect GHL in Settings to enable calendar.');
      }
    } catch (err) {
      console.error('Failed to load GHL config:', err);
      setError('Failed to load calendar configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    onOpenChange(false);
    // Navigate to full calendar page or open booking wizard
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Calendar</DialogTitle>
            <Button size="sm" onClick={handleBookSession}>
              <Plus className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error || !ghlUrl ? (
            <div className="text-center py-12 space-y-4">
              <CalendarIcon className="h-12 w-12 mx-auto opacity-50 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground mb-4">
                  {error || 'Calendar not available'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {error?.includes('Settings') && (
                    <Button 
                      variant="default" 
                      asChild
                    >
                      <Link to="/settings" onClick={() => onOpenChange(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Go to Settings
                      </Link>
                    </Button>
                  )}
                  {ghlUrl && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(ghlUrl, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={ghlUrl}
              className="w-full h-[600px] border-0 rounded-lg"
              title="GHL Calendar"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
