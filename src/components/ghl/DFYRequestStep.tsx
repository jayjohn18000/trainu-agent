import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createDFYRequest } from "@/lib/api/ghl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket } from "lucide-react";

type Props = {
  onNext: () => void;
  onBack: () => void;
  onSubmit: (data: { dfyRequest: any }) => void;
};

export function DFYRequestStep({ onNext, onBack, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    phone: "",
    email: "",
    current_ghl_account: false,
    additional_notes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_name || !formData.phone || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const request = await createDFYRequest(formData);
      onSubmit({ dfyRequest: request });
      toast({
        title: "Request submitted",
        description: "We'll start setting up your GHL account right away",
      });
      onNext();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <Alert>
        <Rocket className="h-4 w-4" />
        <AlertDescription>
          We'll set up your GoHighLevel account with best practices, automation workflows, and integrate it with your TrainU workspace.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business_name">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="Your Fitness Business"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Business Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@yourbusiness.com"
            required
          />
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Switch
            id="current_account"
            checked={formData.current_ghl_account}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, current_ghl_account: checked })
            }
          />
          <Label htmlFor="current_account" className="cursor-pointer">
            I already have a GoHighLevel account
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_notes">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="additional_notes"
            value={formData.additional_notes}
            onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
            placeholder="Any special requirements or information we should know..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
