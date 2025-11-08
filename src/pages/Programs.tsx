import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function Programs() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-12 text-center max-w-md">
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          Program management and planning features are on the way. Stay tuned!
        </p>
      </Card>
    </div>
  );
}
