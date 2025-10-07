import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricTileProps {
  title: string;
  value: string | number;
  delta?: number;
  caption?: string;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}

export function MetricTile({
  title,
  value,
  delta,
  caption,
  format = 'number',
  className,
}: MetricTileProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return `$${numVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'percent':
        return `${numVal}%`;
      default:
        return numVal.toLocaleString('en-US');
    }
  };

  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-foreground">
            {formatValue(value)}
          </h3>
          {delta !== undefined && delta !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-600"
            )}>
              {isPositive && <ArrowUp className="h-4 w-4" />}
              {isNegative && <ArrowDown className="h-4 w-4" />}
              <span>{Math.abs(delta)}%</span>
            </div>
          )}
        </div>
        {caption && (
          <p className="text-xs text-muted-foreground">{caption}</p>
        )}
      </div>
    </Card>
  );
}
