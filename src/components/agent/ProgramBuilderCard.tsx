import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Dumbbell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ProgramBuilderCard() {
  const handleCreateProgram = () => {
    toast({ title: "Not Available", description: "This feature is not available in the demo.", variant: "destructive" });
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group" onClick={handleCreateProgram}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
              Create New Program
              <Sparkles className="h-4 w-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground">
              AI-assisted program builder
            </p>
          </div>
          <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
            Start
          </Button>
        </div>
      </div>
    </Card>
  );
}
