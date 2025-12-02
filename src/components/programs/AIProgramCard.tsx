import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AIProgramCard() {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateProgram = async () => {
    setGenerating(true);
    try {
      // TODO: Call AI agent to generate program
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "Program generated!",
        description: "Your AI-generated program is ready to review.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-glow">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/20 animate-pulse-glow">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Create with AI
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Let AI generate a custom program based on client goals, experience level, and available equipment.
          </p>
          <Button
            onClick={handleGenerateProgram}
            disabled={generating}
            className="w-full sm:w-auto"
          >
            {generating ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Program
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
