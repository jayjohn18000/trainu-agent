import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { BookingData } from "./BookingWizard";
import { useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { useEffect } from "react";

type Props = {
  bookingData: BookingData;
  onClose: () => void;
};

export function SuccessStep({ bookingData, onClose }: Props) {
  const navigate = useNavigate();
  const { sessionType, trainer, date, time } = bookingData;
  const { grantXP } = useGamification();

  useEffect(() => {
    grantXP(20, "Session Booked");
  }, [grantXP]);

  const handleViewCalendar = () => {
    onClose();
    navigate("/calendar");
  };

  return (
    <div className="space-y-6 py-8 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your session has been successfully booked
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 space-y-3 text-left">
        <div>
          <p className="font-semibold text-lg">{sessionType?.title}</p>
          <p className="text-sm text-muted-foreground">with {trainer?.name}</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{date && format(date, "EEEE, MMMM d, yyyy")}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{time}</span>
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>A confirmation email has been sent to your inbox.</p>
        <p>You'll receive a reminder 24 hours before your session.</p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Done
        </Button>
        <Button onClick={handleViewCalendar} className="flex-1">
          View Calendar
        </Button>
      </div>
    </div>
  );
}
