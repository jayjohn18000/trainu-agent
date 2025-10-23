import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 animate-scale-in shadow-lg">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 animate-pulse" />
          <Icon className="h-12 w-12 text-primary relative z-10" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">{description}</p>
      )}
      {action && (
        <Button 
          onClick={action.onClick} 
          size="lg"
          className="btn-glow hover-scale transition-smooth shadow-md hover:shadow-glow"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
