import { 
  Users, 
  Tag, 
  Calendar, 
  BookOpen, 
  BarChart3,
  CheckCircle,
  X,
  Edit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const capabilities = [
  {
    icon: Users,
    label: "Client Info",
    description: "View detailed client metrics, risk scores, and engagement data",
    color: "text-blue-500"
  },
  {
    icon: Tag,
    label: "Smart Tags",
    description: "Suggest and apply intelligent client tags based on behavior patterns",
    color: "text-purple-500"
  },
  {
    icon: Calendar,
    label: "Sessions",
    description: "Schedule, reschedule, and cancel training sessions",
    color: "text-green-500"
  },
  {
    icon: BookOpen,
    label: "Programs",
    description: "Assign training programs to clients based on their goals",
    color: "text-orange-500"
  },
  {
    icon: BarChart3,
    label: "Analytics",
    description: "Access trainer performance statistics and metrics",
    color: "text-pink-500"
  }
];

export function AgentCapabilities() {
  return (
    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          AI Agent Capabilities
        </span>
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      </div>
      
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <Tooltip key={capability.label}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card rounded-md border border-border hover:bg-accent transition-colors cursor-help">
                    <Icon className={`h-3.5 w-3.5 ${capability.color}`} />
                    <span className="text-xs font-medium">{capability.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">{capability.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      
      <p className="text-xs text-muted-foreground mt-1">
        Try: "Schedule Sarah for tomorrow at 3pm" or "Show me at-risk clients"
      </p>
    </div>
  );
}
