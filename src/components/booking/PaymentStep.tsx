import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Zap } from "lucide-react";
import { BookingData } from "./BookingWizard";
import { cn } from "@/lib/utils";

type Props = {
  onNext: () => void;
  onBack: () => void;
  onSelect: (data: Partial<BookingData>) => void;
  selectedMethod?: "stripe" | "whop";
  bookingData: BookingData;
};

export function PaymentStep({ onNext, onBack, onSelect, selectedMethod }: Props) {
  const handlePayment = (method: "stripe" | "whop") => {
    onSelect({ paymentMethod: method });
    // Simulate payment processing
    setTimeout(() => {
      onNext();
    }, 1000);
  };

  return (
    <div className="space-y-6 py-4">
      <p className="text-sm text-muted-foreground">
        Choose your payment method
      </p>

      <div className="space-y-3">
        <Card
          className={cn(
            "p-6 cursor-pointer hover:border-primary transition-all",
            selectedMethod === "stripe" && "border-primary bg-primary/5"
          )}
          onClick={() => handlePayment("stripe")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Credit/Debit Card</p>
                <p className="text-sm text-muted-foreground">Pay with Stripe</p>
              </div>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "p-6 cursor-pointer hover:border-primary transition-all",
            selectedMethod === "whop" && "border-primary bg-primary/5"
          )}
          onClick={() => handlePayment("whop")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Whop Checkout</p>
                <p className="text-sm text-muted-foreground">Fast & secure</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        Back
      </Button>
    </div>
  );
}
