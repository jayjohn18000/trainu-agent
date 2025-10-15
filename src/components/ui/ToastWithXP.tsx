import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";

interface ToastWithXPProps {
  title: string;
  description?: string;
  xpAmount: number;
  xpReason: string;
}

export function showToastWithXP({ title, description, xpAmount, xpReason }: ToastWithXPProps) {
  toast({
    title,
    description: (
      <div className="space-y-2">
        {description && <p>{description}</p>}
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Zap className="h-4 w-4" />
          <span>+{xpAmount} XP - {xpReason}</span>
        </div>
      </div>
    ),
  });
}
