import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ComparisonTableProps {
  tiers: Array<{ name: string; popular?: boolean }>;
  features: Array<{
    category: string;
    items: Array<{
      name: string;
      tiers: [boolean, boolean, boolean];
    }>;
  }>;
}

export function ComparisonTable({ tiers, features }: ComparisonTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="p-4 text-left font-bold text-foreground sticky left-0 bg-muted/30 z-10">
                Feature
              </th>
              {tiers.map((tier, idx) => (
                <th key={idx} className="p-4 text-center font-bold min-w-[140px]">
                  <div className="flex flex-col items-center gap-2">
                    <span>{tier.name}</span>
                    {tier.popular && (
                      <Badge variant="default" className="text-xs">Most Popular</Badge>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((category, catIdx) => (
              <>
                <tr key={`cat-${catIdx}`} className="bg-muted/20">
                  <td colSpan={4} className="p-3 font-semibold text-sm text-primary sticky left-0 bg-muted/20 z-10">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item, itemIdx) => (
                  <tr key={`item-${catIdx}-${itemIdx}`} className="border-b border-border/50 hover:bg-muted/10">
                    <td className="p-4 text-sm sticky left-0 bg-card z-10">{item.name}</td>
                    {item.tiers.map((included, tierIdx) => (
                      <td key={tierIdx} className="p-4 text-center">
                        {included ? (
                          <Check className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
