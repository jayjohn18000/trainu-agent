import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function GymAdminDashboard() {
  const navigate = useNavigate();

  const kpis = [
    { title: "Active Trainers", value: "12", icon: Users, trend: { value: 2, positive: true }, onClick: () => navigate("/admin/trainers") },
    { title: "Monthly Revenue", value: "$24,580", icon: DollarSign, trend: { value: 15, positive: true }, onClick: () => navigate("/growth") },
    { title: "Classes This Week", value: "48", icon: Calendar, trend: { value: 5, positive: true }, onClick: () => navigate("/admin/classes") },
    { title: "Capacity Fill Rate", value: "87%", icon: TrendingUp, trend: { value: 3, positive: true }, onClick: () => navigate("/admin/classes") },
  ];

  const recentActivity = [
    { trainer: "Alex Carter", action: "Completed session with John D.", time: "5 min ago" },
    { trainer: "Riley Nguyen", action: "Created new HIIT class", time: "23 min ago" },
    { trainer: "Jordan Kim", action: "Updated availability", time: "1 hour ago" },
    { trainer: "Sam Patel", action: "Received 5-star review", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gym Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your facility, trainers, and operations</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => toast({ title: "Add Trainer", description: "Opening trainer registration form..." })}
          >
            Add Trainer
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Create Class", description: "Opening class creation form..." })}
          >
            Create Class
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "View Reports", description: "Loading analytics..." })}
          >
            View Reports
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Announcements", description: "Opening announcement editor..." })}
          >
            Post Announcement
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start justify-between pb-4 border-b last:border-b-0 last:pb-0">
              <div>
                <p className="font-medium">{activity.trainer}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4" onClick={() => toast({ title: "View All Activity" })}>
          View All Activity
        </Button>
      </Card>

      {/* Trainer Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performers This Month</h3>
        <div className="space-y-3">
          {[
            { name: "Alex Carter", sessions: 42, revenue: "$3,570", rating: 4.9 },
            { name: "Riley Nguyen", sessions: 38, revenue: "$3,230", rating: 4.8 },
            { name: "Jordan Kim", sessions: 35, revenue: "$4,200", rating: 5.0 },
          ].map((trainer) => (
            <div key={trainer.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">{trainer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {trainer.sessions} sessions • ⭐ {trainer.rating}
                </p>
              </div>
              <span className="font-semibold text-primary">{trainer.revenue}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
