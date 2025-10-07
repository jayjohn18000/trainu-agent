import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Clock, MapPin, Video, Calendar } from "lucide-react";
import { BookingData } from "./BookingWizard";

type Props = {
  onNext: () => void;
  onBack: () => void;
  bookingData: BookingData;
};

export function ReviewStep({ onNext, onBack, bookingData }: Props) {
  const { sessionType, trainer, date, time } = bookingData;

  return (
    <div className="space-y-6 py-4">
      <p className="text-sm text-muted-foreground">
        Review your booking details before proceeding to payment
      </p>

      <Card className="p-4 space-y-4">
        {/* Trainer Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={trainer?.avatarUrl} />
            <AvatarFallback>{trainer?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{trainer?.name}</p>
            <p className="text-sm text-muted-foreground">
              {trainer?.specialties?.[0]}
            </p>
          </div>
        </div>

        <Separator />

        {/* Session Details */}
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-lg">{sessionType?.title}</p>
            <p className="text-sm text-muted-foreground">{sessionType?.description}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{date && format(date, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{time} ({sessionType?.duration} minutes)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {sessionType?.mode === "virtual" ? (
                <><Video className="h-4 w-4" /> Virtual Session</>
              ) : (
                <><MapPin className="h-4 w-4" /> In-Person Session</>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="flex justify-between items-center">
          <p className="font-semibold">Total</p>
          <p className="text-2xl font-bold">
            ${(sessionType?.price / 100).toFixed(2)}
          </p>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
