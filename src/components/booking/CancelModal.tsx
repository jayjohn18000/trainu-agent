import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
  };
  onSuccess?: () => void;
};

export function CancelModal({ open, onOpenChange, session, onSuccess }: Props) {
  const handleCancel = () => {
    toast({
      title: "Session Cancelled",
      description: `${session.title} on ${session.date} has been cancelled.`,
      variant: "destructive",
    });
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to cancel "{session.title}" on {session.date} at {session.time}?
            <br />
            <br />
            <strong>Cancellation Policy:</strong>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li>Free cancellation up to 24 hours before</li>
              <li>50% refund between 24-12 hours</li>
              <li>No refund within 12 hours of session</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Session</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Cancel Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
