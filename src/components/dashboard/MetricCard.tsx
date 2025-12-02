import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

const variantStyles = {
  default: 'border-border bg-card',
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/20 bg-warning/5',
  danger: 'border-danger/20 bg-danger/5',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  onClick 
}: MetricCardProps) {
  return (
    <Card 
      className={`p-6 transition-all duration-base ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2 ${iconVariantStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              trend.positive ? "text-success" : "text-danger"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </Card>
  );
}
