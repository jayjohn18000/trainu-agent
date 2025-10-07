import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateMetricsData } from "@/lib/data";
import { Search, Star } from "lucide-react";

type TimeRange = 7 | 30 | 90;

interface MetricConfig {
  key: string;
  label: string;
  color: string;
}

const metricGroups = {
  growth: [
    { key: "socialReach", label: "Social Reach", color: "#06b6d4" },
    { key: "adClicks", label: "Ad Clicks", color: "#8b5cf6" },
  ],
  operations: [
    { key: "retention", label: "Retention %", color: "#10b981" },
    { key: "missedSessions", label: "Missed Sessions %", color: "#ef4444" },
    { key: "showRate", label: "Show Rate %", color: "#f59e0b" },
    { key: "rebookRate", label: "Rebook Rate %", color: "#06b6d4" },
  ],
  clientProgress: [
    { key: "goalProgress", label: "Avg Goal Progress %", color: "#8b5cf6" },
    { key: "entriesPerWeek", label: "Entries/Week", color: "#10b981" },
  ],
};

export function MetricsChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [selectedGroup, setSelectedGroup] = useState<keyof typeof metricGroups>("growth");
  const [data] = useState(() => generateMetricsData(90));
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.slice(-timeRange);
  const activeMetrics = metricGroups[selectedGroup];

  return (
    <div className="chart-grid space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {(Object.keys(metricGroups) as Array<keyof typeof metricGroups>).map((group) => (
              <Button
                key={group}
                variant={selectedGroup === group ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedGroup(group)}
              >
                {group === "growth" && "Growth"}
                {group === "operations" && "Operations"}
                {group === "clientProgress" && "Client Progress"}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant={timeRange === days ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(days as TimeRange)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>

        {/* Prompt Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ask TrainU... (e.g., 'compare retention vs show-rate last 90 days')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input/50 border-border"
          />
        </div>

        {/* Saved Views */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Saved Views:</span>
          <Button variant="outline" size="sm" className="gap-1">
            <Star className="h-3 w-3" />
            Weekly Overview
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Star className="h-3 w-3" />
            Growth Metrics
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Star className="h-3 w-3" />
            Client Progress
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            {activeMetrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
