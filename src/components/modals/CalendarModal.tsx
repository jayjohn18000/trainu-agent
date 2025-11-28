import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, ExternalLink, Settings, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GhlCalendar {
  id: string;
  name: string;
  duration: number;
  type: string;
}

const STORAGE_KEY = 'trainu-selected-calendar';

export function CalendarModal({ open, onOpenChange }: CalendarModalProps) {
  const [calendars, setCalendars] = useState<GhlCalendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('ghl_config')
        .select('booking_widget_id, ghl_calendars, location_id')
        .eq('trainer_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const calendarList = (data?.ghl_calendars as unknown as GhlCalendar[]) || [];
      setCalendars(calendarList);

      if (calendarList.length > 0) {
        // Try to restore last selected calendar from localStorage
        const savedCalendarId = localStorage.getItem(STORAGE_KEY);
        const savedCalendarExists = calendarList.some(c => c.id === savedCalendarId);
        
        // Use saved calendar, or default/first calendar
        const defaultId = savedCalendarExists 
          ? savedCalendarId 
          : (data?.booking_widget_id || calendarList[0]?.id);
        
        setSelectedCalendarId(defaultId);
      } else if (data?.location_id) {
        setError('No calendars found. Please set up calendars in GHL.');
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

  const handleCalendarSelect = (calendarId: string) => {
    setSelectedCalendarId(calendarId);
    localStorage.setItem(STORAGE_KEY, calendarId);
  };

  const handleBookSession = () => {
    onOpenChange(false);
  };

  const selectedCalendar = calendars.find(c => c.id === selectedCalendarId);
  const ghlUrl = selectedCalendarId 
    ? `https://api.leadconnectorhq.com/widget/booking/${selectedCalendarId}`
    : null;

  // Filter calendars for search (only when 6+ calendars)
  const filteredCalendars = calendars.length >= 6 && searchQuery
    ? calendars.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : calendars;

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
          ) : error || calendars.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <CalendarIcon className="h-12 w-12 mx-auto opacity-50 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground mb-4">
                  {error || 'Calendar not available'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {error?.includes('Settings') && (
                    <Button variant="default" asChild>
                      <Link to="/settings" onClick={() => onOpenChange(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Go to Settings
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Calendar selector - only show if more than 1 calendar */}
              {calendars.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select Calendar
                  </label>
                  
                  {/* Search input for 6+ calendars */}
                  {calendars.length >= 6 && (
                    <Input
                      placeholder="Search calendars..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                  )}
                  
                  <Select
                    value={selectedCalendarId || undefined}
                    onValueChange={handleCalendarSelect}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a calendar">
                        {selectedCalendar && (
                          <div className="flex items-center gap-2">
                            <span>{selectedCalendar.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {selectedCalendar.duration} min
                            </Badge>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-background max-h-60 overflow-y-auto z-50">
                      {filteredCalendars.map((calendar) => (
                        <SelectItem 
                          key={calendar.id} 
                          value={calendar.id}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="truncate">{calendar.name}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {calendar.duration} min
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                      {filteredCalendars.length === 0 && searchQuery && (
                        <div className="py-2 px-3 text-sm text-muted-foreground">
                          No calendars match "{searchQuery}"
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Calendar widget iframe */}
              {ghlUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {calendars.length === 1 && selectedCalendar?.name}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(ghlUrl, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in new tab
                    </Button>
                  </div>
                  <iframe
                    src={ghlUrl}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title="GHL Calendar"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a calendar to view
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
