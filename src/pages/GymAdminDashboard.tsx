import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, TrendingUp, Flame, Trophy, Activity, Crown, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { WhopBadge } from "@/components/ui/WhopBadge";
import { GHLBadge } from "@/components/ui/GHLBadge";

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gym Admin Dashboard</h1>
        <p className="text-muted-foreground">Community health, integrations, and operations at a glance</p>
      </div>

      {/* Community Health Metrics - NEW HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-orange-500/10">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Consistency Rate</h3>
              <p className="text-3xl font-bold text-orange-500">87%</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Clients hitting weekly goals</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">↑ 12% from last month</Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Show-Up Rate</h3>
              <p className="text-3xl font-bold text-green-500">92%</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Session attendance this week</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">↑ 5% from last week</Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Community Engagement</h3>
              <p className="text-3xl font-bold text-purple-500">156</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Posts & reactions this week</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">42 events registered</Badge>
          </div>
        </Card>
      </div>

      {/* Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Whop Integration</h3>
            </div>
            <Badge variant="secondary" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Connected
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Members</span>
              <span className="font-medium">127</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">MRR</span>
              <span className="font-medium">$12,700</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Churn Rate</span>
              <span className="font-medium text-green-500">4.2%</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" size="sm">
            Manage in Whop
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold">GHL Integration</h3>
            </div>
            <Badge variant="secondary" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Automated Messages</span>
              <span className="font-medium">342 this month</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response Rate</span>
              <span className="font-medium text-green-500">89%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Appointments Booked</span>
              <span className="font-medium">156</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" size="sm">
            View in GHL
          </Button>
        </Card>
      </div>

      {/* Streak Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-semibold">Streak Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: "Sarah Johnson", weeks: 12, avatar: "SJ", rank: 1 },
            { name: "Mike Chen", weeks: 10, avatar: "MC", rank: 2 },
            { name: "Alex Williams", weeks: 8, avatar: "AW", rank: 3 },
            { name: "Jamie Lee", weeks: 7, avatar: "JL", rank: 4 },
            { name: "Taylor Smith", weeks: 6, avatar: "TS", rank: 5 },
          ].map((member) => (
            <div 
              key={member.name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                  ${member.rank === 1 ? 'bg-amber-500 text-white' : ''}
                  ${member.rank === 2 ? 'bg-slate-400 text-white' : ''}
                  ${member.rank === 3 ? 'bg-orange-600 text-white' : ''}
                  ${member.rank > 3 ? 'bg-muted text-muted-foreground' : ''}
                `}>
                  {member.rank}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-orange-500">{member.weeks} weeks</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
