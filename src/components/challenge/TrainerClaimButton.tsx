import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

type Props = {
  trainerKey: string;
  trainerName: string;
  isVerified: boolean;
  onClaim: () => void;
};

export function TrainerClaimButton({ trainerKey, trainerName, isVerified, onClaim }: Props) {
  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>Verified Trainer</span>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onClaim} className="gap-2">
      <Shield className="h-4 w-4" />
      Claim This Profile
    </Button>
  );
}
