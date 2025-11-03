import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  image?: string;
  variant?: "default" | "hover-lift" | "gradient";
  className?: string;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  image,
  variant = "hover-lift",
  className 
}: FeatureCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variant === "hover-lift" && "hover:scale-[1.02] hover:shadow-glow",
        variant === "gradient" && "bg-gradient-to-br from-card to-background",
        className
      )}
    >
      {image && (
        <div className="absolute inset-0 opacity-10">
          <img 
            src={image} 
            alt="" 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="relative p-6">
        <div className="mb-4 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}
