import { useEffect, useState } from "react";
import { MetricTile } from "@/components/ui/MetricTile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { computeMetrics, getTrendData } from "@/lib/mock/metrics";
import type { MetricsTiles, TrendData } from "@/lib/mock/metrics";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsTiles | null>(null);
  const [trends, setTrends] = useState<{
    paidToBooked: TrendData[];
    showRate: TrendData[];
  } | null>(null);

  useEffect(() => {
    setMetrics(computeMetrics());
    setTrends(getTrendData());
  }, []);

  if (!metrics || !trends) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business metrics</p>
      </div>

      {/* Top Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricTile
          title="Paid → Booked 72h"
          value={metrics.paidToBooked72h}
          format="percent"
          caption="Last 7 days"
        />
        <MetricTile
          title="Show Rate"
          value={metrics.showRate}
          format="percent"
          caption="Last 30 days"
        />
        <MetricTile
          title="New Members"
          value={metrics.newMembers}
          caption="Last 7 days"
        />
        <MetricTile
          title="Affiliate GMV"
          value={metrics.affiliateGMV}
          format="currency"
          caption="Last 30 days"
        />
        <MetricTile
          title="Creator ROI"
          value={metrics.creatorROI.toFixed(1)}
          caption="Last 30 days"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Paid → Booked Trend</h3>
          <div className="h-48 flex items-end gap-4">
            {trends.paidToBooked.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${point.value}%` }}>
                  <div className="absolute -top-6 left-0 right-0 text-center text-sm font-medium">
                    {point.value}%
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{point.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Show Rate Trend</h3>
          <div className="h-48 flex items-end gap-4">
            {trends.showRate.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-green-500/20 rounded-t-lg relative" style={{ height: `${point.value}%` }}>
                  <div className="absolute -top-6 left-0 right-0 text-center text-sm font-medium">
                    {point.value}%
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{point.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Shortcuts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/events')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button onClick={() => navigate('/store')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Affiliate Product
          </Button>
          <Button onClick={() => navigate('/creators')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Brief
          </Button>
        </div>
      </Card>
    </div>
  );
}
