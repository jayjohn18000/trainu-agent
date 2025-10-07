import { useNavigate } from "react-router-dom";
import { Users, Calendar, TrendingUp, Target, Sparkles, Clock, Send, MessageSquare } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { MetricsChart } from "@/components/MetricsChart";
import { trainerKPIs } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function TrainerDashboard() {
  const navigate = useNavigate();

  const handleViewAllSessions = () => {
    toast({ title: "All Sessions", description: "Full calendar view coming soon!" });
  };

  const handleViewAllUpdates = () => {
    toast({ title: "All Updates", description: "Full activity feed coming soon!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trainer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered coaching command center
        </p>
      </div>

      {/* AI Activity Feed - HERO SECTION */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-purple-500/10">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Activity Feed</h2>
            <p className="text-sm text-muted-foreground">Real-time AI insights and automated actions</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { 
              icon: Clock, 
              color: "text-blue-500", 
              bg: "bg-blue-500/10",
              action: "AI drafting pre-session reminder",
              client: "Mike Johnson",
              time: "2 min ago",
              status: "needs_review"
            },
            { 
              icon: Send, 
              color: "text-green-500", 
              bg: "bg-green-500/10",
              action: "Streak protection message sent",
              client: "Sarah Williams",
              time: "15 min ago",
              status: "sent"
            },
            { 
              icon: MessageSquare, 
              color: "text-purple-500", 
              bg: "bg-purple-500/10",
              action: "Milestone celebration queued",
              client: "Alex Chen",
              time: "1 hour ago",
              status: "scheduled"
            },
          ].map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div 
                key={idx}
                className="flex items-center gap-4 p-4 rounded-lg bg-background border hover:border-purple-500/30 transition-colors cursor-pointer"
                onClick={() => navigate("/inbox")}
              >
                <div className={`p-2 rounded-full ${activity.bg}`}>
                  <Icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">for {activity.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 gap-2"
          onClick={() => navigate("/inbox")}
        >
          <Sparkles className="h-4 w-4" />
          View AI Inbox
        </Button>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Clients"
          value={trainerKPIs.activeClients}
          icon={Users}
          trend={{ value: 12, positive: true }}
          onClick={() => navigate("/clients")}
        />
        <KPICard
          title="Sessions This Week"
          value={trainerKPIs.sessionsThisWeek}
          icon={Calendar}
          trend={{ value: 8, positive: true }}
          onClick={() => navigate("/calendar")}
        />
        <KPICard
          title="Retention Rate"
          value={`${trainerKPIs.retention}%`}
          icon={TrendingUp}
          trend={{ value: 3, positive: true }}
          onClick={() => navigate("/clients")}
        />
        <KPICard
          title="Avg Client Progress"
          value={`${trainerKPIs.avgProgress}%`}
          icon={Target}
          trend={{ value: 5, positive: true }}
          onClick={() => navigate("/clients")}
        />
      </div>

      {/* Main Chart */}
      <MetricsChart />

      {/* Secondary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {[
              { client: "Alex Johnson", time: "Tomorrow 10:00 AM", type: "Strength Training" },
              { client: "Jamie Smith", time: "Tomorrow 2:00 PM", type: "HIIT Cardio" },
              { client: "Casey Brooks", time: "Friday 9:00 AM", type: "Olympic Lifting" },
            ].map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{session.client}</p>
                  <p className="text-sm text-muted-foreground">{session.type}</p>
                </div>
                <p className="text-sm text-muted-foreground">{session.time}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={handleViewAllSessions}>
            View All Sessions
          </Button>
        </div>

        {/* Recent Client Updates */}
        <div className="metric-card">
          <h3 className="text-lg font-semibold mb-4">Recent Client Updates</h3>
          <div className="space-y-3">
            {[
              { client: "Alex Johnson", update: "Completed week 4 of program", time: "2h ago" },
              { client: "Taylor Morgan", update: "New PR: 225lb squat!", time: "5h ago" },
              { client: "Jordan Lee", update: "Check-in photo uploaded", time: "1d ago" },
            ].map((update, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{update.client}</p>
                  <p className="text-sm text-muted-foreground">{update.update}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{update.time}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={handleViewAllUpdates}>
            View All Updates
          </Button>
        </div>
      </div>
    </div>
  );
}
