import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Check } from "lucide-react";
import { toast } from "sonner";

export function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagram: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission - in production, this would send to your backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Welcome to TrainU! Check your email for next steps.");
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-success/30 text-center">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-2xl font-bold mb-2">You're In!</h3>
        <p className="text-muted-foreground mb-6">
          Check your email for your personalized revenue plan and next steps.
        </p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-card border border-border">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">
            Instagram Handle <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="instagram"
            placeholder="@yourhandle"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            className="h-12"
          />
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full h-14 text-lg bg-success hover:bg-success/90 text-success-foreground shadow-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Setting up your plan..."
          ) : (
            <>
              Start My Revenue Pathway
              <TrendingUp className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </form>
  );
}
