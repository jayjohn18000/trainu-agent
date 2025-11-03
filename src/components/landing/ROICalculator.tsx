import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ROICalculator() {
  const [clients, setClients] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [churnRate, setChurnRate] = useState(20);

  // Calculate savings
  const monthlyRevenue = clients * hourlyRate * 4;
  const clientsAtRisk = Math.round(clients * (churnRate / 100));
  const potentialLoss = clientsAtRisk * hourlyRate * 4;
  const savedClients = Math.round(clientsAtRisk * 0.7); // 70% retention improvement
  const moneySaved = savedClients * hourlyRate * 4;
  const timeSaved = clients * 2; // 2 hours saved per client per month

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
      <h3 className="text-2xl font-bold mb-6 text-center">Calculate Your ROI</h3>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div>
          <Label htmlFor="clients" className="text-muted-foreground">Number of Clients</Label>
          <Input
            id="clients"
            type="number"
            value={clients}
            onChange={(e) => setClients(Number(e.target.value))}
            className="mt-2"
            min={1}
          />
        </div>
        
        <div>
          <Label htmlFor="rate" className="text-muted-foreground">Hourly Rate ($)</Label>
          <Input
            id="rate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="mt-2"
            min={1}
          />
        </div>
        
        <div>
          <Label htmlFor="churn" className="text-muted-foreground">Churn Rate (%)</Label>
          <Input
            id="churn"
            type="number"
            value={churnRate}
            onChange={(e) => setChurnRate(Number(e.target.value))}
            className="mt-2"
            min={0}
            max={100}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
            <p className="text-sm text-muted-foreground mb-1">Without TrainU</p>
            <p className="text-3xl font-bold text-danger">${potentialLoss.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Potential monthly loss from {clientsAtRisk} at-risk clients</p>
          </div>
          
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-muted-foreground mb-1">Time Wasted</p>
            <p className="text-3xl font-bold text-warning">{timeSaved}hrs</p>
            <p className="text-sm text-muted-foreground mt-1">Monthly admin time on manual follow-ups</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-muted-foreground mb-1">With TrainU</p>
            <p className="text-3xl font-bold text-success">${moneySaved.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Saved by retaining {savedClients} clients (70% improvement)</p>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Time Saved</p>
            <p className="text-3xl font-bold text-primary">{Math.round(timeSaved * 0.8)}hrs</p>
            <p className="text-sm text-muted-foreground mt-1">AI handles 80% of client communication</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
        <p className="text-2xl font-bold text-primary mb-2">
          Net Monthly Benefit: ${(moneySaved - 99).toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          TrainU pays for itself in less than 4 clients saved
        </p>
      </div>
    </Card>
  );
}
