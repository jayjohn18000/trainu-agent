import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactImportStep } from "./ContactImportStep";
import { DFYRequestStep } from "./DFYRequestStep";
import { ProvisioningWaitStep } from "./ProvisioningWaitStep";
import { OnboardingSuccessStep } from "./OnboardingSuccessStep";

export type OnboardingData = {
  contactsImported?: boolean;
  dfyRequest?: any;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GHLOnboardingWizard({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const resetWizard = () => {
    setStep(1);
    setOnboardingData({});
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
            {step === 1 && "Import Your Contacts"}
            {step === 2 && "Request GHL Setup"}
            {step === 3 && "Setting Up Your Account"}
            {step === 4 && "Setup Complete!"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <ContactImportStep
            onNext={nextStep}
            onSkip={nextStep}
            onImport={updateOnboardingData}
          />
        )}
        {step === 2 && (
          <DFYRequestStep
            onNext={nextStep}
            onBack={prevStep}
            onSubmit={updateOnboardingData}
          />
        )}
        {step === 3 && (
          <ProvisioningWaitStep
            onComplete={nextStep}
            dfyRequest={onboardingData.dfyRequest}
          />
        )}
        {step === 4 && (
          <OnboardingSuccessStep onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
