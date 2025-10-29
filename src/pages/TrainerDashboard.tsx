import { useNavigate } from "react-router-dom";
import { Users, Calendar, TrendingUp, Target } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { MetricsChart } from "@/components/MetricsChart";
import { trainerKPIs } from "@/lib/data";
import { toast } from "@/hooks/use-toast";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { RecentUpdates } from "@/components/dashboard/RecentUpdates";
import { AIActivityFeed } from "@/components/dashboard/AIActivityFeed";

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
        <UpcomingSessions onViewAll={handleViewAllSessions} />
        <RecentUpdates onViewAll={handleViewAllUpdates} />
      </div>

      {/* AI Activity Feed */}
      <AIActivityFeed />
    </div>
  );
}
