import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function MeasurementsTab() {
  const [measurements, setMeasurements] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
  });

  const mockData = [
    { date: "Week 1", weight: 180, bodyFat: 22, waist: 36 },
    { date: "Week 2", weight: 178, bodyFat: 21.5, waist: 35.5 },
    { date: "Week 3", weight: 177, bodyFat: 21, waist: 35 },
    { date: "Week 4", weight: 175, bodyFat: 20.5, waist: 34.5 },
    { date: "Week 5", weight: 174, bodyFat: 20, waist: 34 },
    { date: "Week 6", weight: 173, bodyFat: 19.5, waist: 33.5 },
  ];

  const recentLogs = [
    { date: "2025-10-01", weight: 173, bodyFat: 19.5, waist: 33.5 },
    { date: "2025-09-24", weight: 174, bodyFat: 20, waist: 34 },
    { date: "2025-09-17", weight: 175, bodyFat: 20.5, waist: 34.5 },
  ];

  const handleLogMeasurement = () => {
    const hasData = Object.values(measurements).some(val => val !== "");
    if (!hasData) {
      toast({ 
        title: "Error", 
        description: "Please enter at least one measurement", 
        variant: "destructive" 
      });
      return;
    }
    
    toast({
      title: "Measurements Logged",
      description: "Your measurements have been saved successfully",
    });
    
    setMeasurements({
      weight: "",
      bodyFat: "",
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Log New Measurements</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="173"
                value={measurements.weight}
                onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bodyFat">Body Fat %</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="19.5"
                value={measurements.bodyFat}
                onChange={(e) => setMeasurements(prev => ({ ...prev, bodyFat: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="chest">Chest (in)</Label>
              <Input
                id="chest"
                type="number"
                placeholder="42"
                value={measurements.chest}
                onChange={(e) => setMeasurements(prev => ({ ...prev, chest: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="waist">Waist (in)</Label>
              <Input
                id="waist"
                type="number"
                placeholder="33.5"
                value={measurements.waist}
                onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="hips">Hips (in)</Label>
              <Input
                id="hips"
                type="number"
                placeholder="38"
                value={measurements.hips}
                onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="arms">Arms (in)</Label>
              <Input
                id="arms"
                type="number"
                placeholder="15"
                value={measurements.arms}
                onChange={(e) => setMeasurements(prev => ({ ...prev, arms: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="thighs">Thighs (in)</Label>
              <Input
                id="thighs"
                type="number"
                placeholder="24"
                value={measurements.thighs}
                onChange={(e) => setMeasurements(prev => ({ ...prev, thighs: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <Button onClick={handleLogMeasurement}>Log Measurements</Button>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weight & Body Fat Trend</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-chart-3" />
                <span className="font-medium">-7 lbs</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-chart-2" />
                <span className="font-medium">-2.5%</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
                name="Weight (lbs)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFat"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
                name="Body Fat %"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Waist Measurement</h3>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-chart-3" />
              <span className="font-medium">-2.5 in</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[32, 37]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="waist"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-3))" }}
                name="Waist (in)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Measurements</h3>
        <div className="space-y-3">
          {recentLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{log.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Weight: </span>
                    <span className="font-medium">{log.weight} lbs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Body Fat: </span>
                    <span className="font-medium">{log.bodyFat}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Waist: </span>
                    <span className="font-medium">{log.waist} in</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
