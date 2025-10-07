import { Card } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Props = {
  clientId: string;
};

const progressData = [
  { date: "Week 1", weight: 180, bodyFat: 22 },
  { date: "Week 2", weight: 178, bodyFat: 21.5 },
  { date: "Week 3", weight: 177, bodyFat: 21 },
  { date: "Week 4", weight: 175, bodyFat: 20.5 },
  { date: "Week 5", weight: 174, bodyFat: 20 },
  { date: "Week 6", weight: 172, bodyFat: 19.5 },
  { date: "Week 7", weight: 171, bodyFat: 19 },
  { date: "Week 8", weight: 170, bodyFat: 18.5 },
];

export function ClientProgressChart({ clientId }: Props) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Progress Tracking</h3>
      <div className="space-y-8">
        <div>
          <p className="text-sm text-muted-foreground mb-4">Weight (lbs)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                domain={[165, 185]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-4">Body Fat %</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                domain={[15, 25]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
