import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "@/hooks/use-toast";

const goals = [
  { id: "1", name: "Weight Loss", metric: "Weight (lbs)", current: 175, target: 160 },
  { id: "2", name: "Strength Training", metric: "Bench Press (lbs)", current: 185, target: 225 },
  { id: "3", name: "Endurance", metric: "5K Time (min)", current: 28, target: 24 },
];

const goalData = {
  "1": [
    { date: "Week 1", value: 185, milestone: "Start" },
    { date: "Week 2", value: 183 },
    { date: "Week 3", value: 181 },
    { date: "Week 4", value: 180, milestone: "-5 lbs" },
    { date: "Week 5", value: 178 },
    { date: "Week 6", value: 177 },
    { date: "Week 7", value: 176 },
    { date: "Week 8", value: 175, milestone: "-10 lbs" },
  ],
  "2": [
    { date: "Week 1", value: 165, milestone: "Start" },
    { date: "Week 2", value: 170 },
    { date: "Week 3", value: 172 },
    { date: "Week 4", value: 175, milestone: "+10 lbs" },
    { date: "Week 5", value: 178 },
    { date: "Week 6", value: 180 },
    { date: "Week 7", value: 183 },
    { date: "Week 8", value: 185, milestone: "+20 lbs" },
  ],
  "3": [
    { date: "Week 1", value: 32, milestone: "Start" },
    { date: "Week 2", value: 31 },
    { date: "Week 3", value: 30 },
    { date: "Week 4", value: 30, milestone: "-2 min" },
    { date: "Week 5", value: 29 },
    { date: "Week 6", value: 29 },
    { date: "Week 7", value: 28 },
    { date: "Week 8", value: 28, milestone: "-4 min" },
  ],
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState("1");
  const [loading, setLoading] = useState<string | null>(null);
  const currentGoal = goals.find((g) => g.id === selectedGoal)!;
  const chartData = goalData[selectedGoal as keyof typeof goalData];
  const progress = Math.round(((currentGoal.current - 185) / (currentGoal.target - 185)) * 100);

  const handleLogProgress = async () => {
    setLoading("progress");
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Progress logged!", description: "Your measurements have been updated." });
    setLoading(null);
  };

  const handleUploadCheckIn = async () => {
    setLoading("checkin");
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Check-in uploaded!", description: "Your progress photos have been saved." });
    setLoading(null);
  };

  const handleMessageTrainer = () => {
    navigate("/messages");
  };

  const handleBookSession = () => {
    toast({ title: "Booking system", description: "Session booking will be available soon!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay on top of your goals</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="My Progress"
          value={`${Math.abs(progress)}%`}
          subtitle="toward goal"
          icon={TrendingUp}
          trend={{ value: 12, positive: true }}
          onClick={() => navigate("/progress")}
        />
        <KPICard 
          title="Open Goals" 
          value={3} 
          subtitle="in progress" 
          onClick={() => navigate("/progress")}
        />
        <KPICard 
          title="Entries This Week" 
          value={5} 
          subtitle="logged" 
          onClick={() => navigate("/progress")}
        />
        <KPICard 
          title="Next Session" 
          value="Tomorrow" 
          subtitle="2:00 PM with Sarah" 
          onClick={() => navigate("/calendar")}
        />
      </div>

      {/* Goal Chart */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Goal Progress</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Current: {currentGoal.current} {currentGoal.metric.split("(")[1]?.replace(")", "")} • Target: {currentGoal.target}{" "}
              {currentGoal.metric.split("(")[1]?.replace(")", "")}
            </p>
          </div>
          <Select value={selectedGoal} onValueChange={setSelectedGoal}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              {goals.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            {chartData
              .filter((d) => d.milestone)
              .map((d, i) => (
                <ReferenceLine
                  key={i}
                  x={d.date}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                  label={{
                    value: d.milestone,
                    position: "top",
                    fill: "hsl(var(--primary))",
                    fontSize: 12,
                  }}
                />
              ))}
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="metric-card">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="gap-2 h-auto py-4"
            onClick={handleLogProgress}
            disabled={loading === "progress"}
          >
            <TrendingUp className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">
                {loading === "progress" ? "Logging..." : "Log Progress"}
              </div>
              <div className="text-xs opacity-80">Update your measurements</div>
            </div>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 h-auto py-4"
            onClick={handleUploadCheckIn}
            disabled={loading === "checkin"}
          >
            <Upload className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">
                {loading === "checkin" ? "Uploading..." : "Upload Check-in"}
              </div>
              <div className="text-xs opacity-80">Share your progress photos</div>
            </div>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 h-auto py-4"
            onClick={handleMessageTrainer}
          >
            <MessageSquare className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Message Trainer</div>
              <div className="text-xs opacity-80">Ask questions or get advice</div>
            </div>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 h-auto py-4"
            onClick={handleBookSession}
          >
            <Calendar className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Book Session</div>
              <div className="text-xs opacity-80">Schedule your next workout</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
