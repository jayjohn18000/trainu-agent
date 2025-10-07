import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilityEditor } from "./AvailabilityEditor";
import { AvailabilityExceptions } from "./AvailabilityExceptions";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { calendarApi } from "@/services/calendar";
import { toast } from "@/hooks/use-toast";

interface AvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerId: string;
}

export function AvailabilityDialog({ open, onOpenChange, trainerId }: AvailabilityDialogProps) {
  const {
    availabilityRules,
    availabilityExceptions,
    setAvailabilityRules,
    setAvailabilityExceptions,
  } = useCalendarStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && trainerId) {
      loadAvailability();
    }
  }, [open, trainerId]);

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const [rules, exceptions] = await Promise.all([
        calendarApi.getAvailabilityRules(trainerId),
        calendarApi.getAvailabilityExceptions(trainerId),
      ]);
      setAvailabilityRules(rules);
      setAvailabilityExceptions(exceptions);
    } catch (error) {
      console.error("Failed to load availability:", error);
      toast({
        title: "Error",
        description: "Failed to load availability settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRules = async (rules: any[]) => {
    setIsLoading(true);
    try {
      // In production, this would call the API
      setAvailabilityRules(rules);
      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExceptions = async (exceptions: any[]) => {
    setIsLoading(true);
    try {
      setAvailabilityExceptions(exceptions);
      toast({
        title: "Success",
        description: "Exceptions updated successfully",
      });
    } catch (error) {
      console.error("Failed to update exceptions:", error);
      toast({
        title: "Error",
        description: "Failed to update exceptions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Availability</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="weekly" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6">
            <AvailabilityEditor
              trainerId={trainerId}
              rules={availabilityRules.filter((r) => r.trainerId === trainerId)}
              onUpdate={handleUpdateRules}
            />
          </TabsContent>

          <TabsContent value="exceptions" className="mt-6">
            <AvailabilityExceptions
              trainerId={trainerId}
              exceptions={availabilityExceptions.filter((e) => e.trainerId === trainerId)}
              onUpdate={handleUpdateExceptions}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
