import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock sessions
const mockSessions = [
  {
    id: "1",
    clientName: "John Doe",
    type: "Personal Training",
    time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 60,
    status: "upcoming" as const,
  },
  {
    id: "2",
    clientName: "Sarah Wilson",
    type: "Strength Training",
    time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 45,
    status: "upcoming" as const,
  },
  {
    id: "3",
    clientName: "Mike Johnson",
    type: "Cardio Session",
    time: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
    duration: 30,
    status: "upcoming" as const,
  },
];

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
      const { data, error: fetchError } = await supabase
        .from('ghl_config')
        .select('booking_widget_id')
        .single();

      if (fetchError) throw fetchError;

      if (data?.booking_widget_id) {
        // Construct URL from widget ID
        setGhlUrl(`https://calendar.appoint.ly/${data.booking_widget_id}`);
      } else {
        setError('No GHL calendar configured');
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
                  Can't load GHL calendar
                </p>
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
