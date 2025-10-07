import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SessionTypeStep } from "./SessionTypeStep";
import { DateTimeStep } from "./DateTimeStep";
import { ReviewStep } from "./ReviewStep";
import { PaymentStep } from "./PaymentStep";
import { SuccessStep } from "./SuccessStep";

export type BookingData = {
  sessionType?: any;
  trainer?: any;
  date?: Date;
  time?: string;
  paymentMethod?: "stripe" | "whop";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookingWizard({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const resetWizard = () => {
    setStep(1);
    setBookingData({});
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Choose Session Type"}
            {step === 2 && "Select Date & Time"}
            {step === 3 && "Review Booking"}
            {step === 4 && "Payment"}
            {step === 5 && "Booking Confirmed"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <SessionTypeStep
            onNext={nextStep}
            onSelect={updateBookingData}
            selected={bookingData.sessionType}
          />
        )}
        {step === 2 && (
          <DateTimeStep
            onNext={nextStep}
            onBack={prevStep}
            onSelect={updateBookingData}
            selectedDate={bookingData.date}
            selectedTime={bookingData.time}
            sessionType={bookingData.sessionType}
          />
        )}
        {step === 3 && (
          <ReviewStep
            onNext={nextStep}
            onBack={prevStep}
            bookingData={bookingData}
          />
        )}
        {step === 4 && (
          <PaymentStep
            onNext={nextStep}
            onBack={prevStep}
            onSelect={updateBookingData}
            selectedMethod={bookingData.paymentMethod}
            bookingData={bookingData}
          />
        )}
        {step === 5 && (
          <SuccessStep
            bookingData={bookingData}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
