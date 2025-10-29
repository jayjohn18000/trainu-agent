import { useMemo } from "react";
import { Client } from "@/lib/data/clients/types";

interface ClientsStatsProps {
  clients: Client[];
  total: number;
}

export function ClientsStats({ clients, total }: ClientsStatsProps) {
  const stats = useMemo(() => ({
    total,
    active: clients.filter((c) => c.status === "active").length,
    atRisk: clients.filter((c) => c.status === "churnRisk").length,
    paused: clients.filter((c) => c.status === "paused").length,
  }), [clients, total]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Clients</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Active</p>
        <p className="text-2xl font-bold">{stats.active}</p>
      </div>
      <div className="rounded-lg border p-4 bg-warning/10">
        <p className="text-sm text-muted-foreground">At Risk</p>
        <p className="text-2xl font-bold text-warning">{stats.atRisk}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Paused</p>
        <p className="text-2xl font-bold">{stats.paused}</p>
      </div>
    </div>
  );
}

