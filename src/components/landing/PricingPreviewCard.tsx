import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingPreviewCardProps {
  tier: {
    name: string;
    price: number;
    description: string;
    popular?: boolean;
    roi: string;
    highlights: string[];
  };
}

export function PricingPreviewCard({ tier }: PricingPreviewCardProps) {
  return (
    <Card className={`p-6 relative ${tier.popular ? 'border-primary shadow-glow' : ''}`}>
      {tier.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-md">
          Most Popular
        </Badge>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
        <div className="text-4xl font-black text-primary mb-2">
          ${tier.price}<span className="text-lg text-muted-foreground font-normal">/mo</span>
        </div>
        <p className="text-sm text-muted-foreground">{tier.description}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {tier.highlights.map((highlight, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      <div className="text-center mb-4">
        <p className="text-xs font-semibold text-primary">{tier.roi}</p>
      </div>

      <Link to="/pricing" className="block">
        <Button 
          className="w-full" 
          variant={tier.popular ? "default" : "outline"}
        >
          View Full Details
        </Button>
      </Link>
    </Card>
  );
}
