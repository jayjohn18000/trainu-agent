import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Send } from "lucide-react";

type ActivityIconColor = "text-info" | "text-success";

interface Activity {
  icon: typeof Clock;
  color: ActivityIconColor;
  action: string;
  client: string;
  time: string;
}

interface AIActivityFeedProps {
  activities?: Activity[];
}

export function AIActivityFeed({ activities }: AIActivityFeedProps) {
  const navigate = useNavigate();
  
  const defaultActivities: Activity[] = [
    { 
      icon: Clock, 
      color: "text-info", 
      action: "Pre-session reminder",
      client: "Mike Johnson",
      time: "2m",
    },
    { 
      icon: Send, 
      color: "text-success", 
      action: "Streak protection sent",
      client: "Sarah Williams",
      time: "15m",
    },
  ];

  const displayActivities = activities || defaultActivities;

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-500/10">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">AI Activity</h3>
            <p className="text-xs text-muted-foreground">Latest automated actions</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1 text-xs"
          onClick={() => navigate("/inbox")}
        >
          <Sparkles className="h-3 w-3" />
          View All
        </Button>
      </div>
      
      <div className="space-y-2">
        {displayActivities.map((activity, idx) => {
          const Icon = activity.icon;
          return (
            <div 
              key={idx}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer text-sm"
              onClick={() => navigate("/inbox")}
            >
              <Icon className={`h-3 w-3 ${activity.color}`} />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{activity.action}</span>
                <span className="text-muted-foreground"> · {activity.client}</span>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

