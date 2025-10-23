import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientSearch } from "@/components/clients/ClientSearch";
import { ClientFilters, ClientFiltersState } from "@/components/clients/ClientFilters";
import { ClientInspector } from "@/components/clients/ClientInspector";
import { NudgeDialog } from "@/components/clients/NudgeDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Client, ClientDetail } from "@/lib/data/clients/types";
import { clientProvider } from "@/lib/data/clients/provider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Users, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { analytics } from "@/lib/analytics";
import { memo } from "react";

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [nudgeClient, setNudgeClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const query = searchParams.get("q") || "";
  const selectedId = searchParams.get("id") || undefined;
  const sortBy = (searchParams.get("sort") as "name" | "risk" | "lastActivity") || "name";
  const sortDir = (searchParams.get("dir") as "asc" | "desc") || "asc";
  
  const [filters, setFilters] = useState<ClientFiltersState>({
    tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    status: searchParams.get("status") || undefined,
    riskMin: searchParams.get("riskMin") ? Number(searchParams.get("riskMin")) : undefined,
    riskMax: searchParams.get("riskMax") ? Number(searchParams.get("riskMax")) : undefined,
    hasNext: searchParams.get("hasNext") === "true" ? true : undefined,
  });

  const updateURL = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await clientProvider.list({
        q: query || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        status: filters.status,
        riskMin: filters.riskMin,
        riskMax: filters.riskMax,
        hasNext: filters.hasNext,
        sort: sortBy,
        dir: sortDir,
      });
      setClients(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [query, filters, sortBy, sortDir]);

  useEffect(() => {
    if (selectedId) {
      setInspectorLoading(true);
      clientProvider
        .get(selectedId)
        .then(setSelectedClient)
        .catch((error) => {
          console.error("Failed to load client:", error);
          toast({
            title: "Error",
            description: "Failed to load client details",
            variant: "destructive",
          });
        })
        .finally(() => setInspectorLoading(false));
    } else {
      setSelectedClient(null);
    }
  }, [selectedId]);

  const handleSelectClient = (client: Client) => {
    updateURL({ id: client.id });
    analytics.track('client_viewed', { clientId: client.id });
  };

  const handleCloseInspector = () => {
    updateURL({ id: undefined });
  };

  const handleSearchChange = (value: string) => {
    updateURL({ q: value || undefined });
  };

  const handleFiltersChange = (newFilters: ClientFiltersState) => {
    setFilters(newFilters);
    updateURL({
      tags: newFilters.tags.length > 0 ? newFilters.tags.join(",") : undefined,
      status: newFilters.status,
      riskMin: newFilters.riskMin?.toString(),
      riskMax: newFilters.riskMax?.toString(),
      hasNext: newFilters.hasNext?.toString(),
    });
  };

  const handleSort = (field: string) => {
    const newDir = sortBy === field && sortDir === "asc" ? "desc" : "asc";
    updateURL({ sort: field, dir: newDir });
  };

  const handleNudge = async (templateId: string, preview: string) => {
    if (!nudgeClient) return;
    try {
      await clientProvider.nudge(nudgeClient.id, { templateId, preview });
      analytics.track('client_nudged', { clientId: nudgeClient.id, templateId });
      toast({
        title: "Nudge sent",
        description: `Message sent to ${nudgeClient.name}`,
      });
    } catch (error) {
      console.error("Failed to send nudge:", error);
      toast({
        title: "Error",
        description: "Failed to send nudge",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTags = async (tags: string[]) => {
    if (!selectedClient) return;
    try {
      await clientProvider.tag(selectedClient.id, tags);
      setSelectedClient({ ...selectedClient, tags });
      toast({ title: "Tags updated" });
      loadClients();
    } catch (error) {
      console.error("Failed to update tags:", error);
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async (note: string) => {
    if (!selectedClient) return;
    try {
      await clientProvider.note(selectedClient.id, note);
      setSelectedClient({ ...selectedClient, notes: note });
      toast({ title: "Note saved" });
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  useKeyboardShortcuts([
    {
      key: "/",
      description: "Focus search",
      callback: () => document.querySelector<HTMLInputElement>("input")?.focus(),
    },
    {
      key: "Escape",
      description: "Close inspector",
      callback: () => {
        if (selectedId) handleCloseInspector();
        if (nudgeClient) setNudgeClient(null);
      },
    },
    {
      key: "n",
      description: "Nudge selected client",
      callback: () => {
        if (selectedClient) {
          setNudgeClient(selectedClient);
        }
      },
    },
  ]);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 animate-fade-in" role="main" aria-label="Clients page">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Clients</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your client roster and track their progress
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <ClientSearch value={query} onChange={handleSearchChange} />
        </div>
        <ClientFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">
            {clients.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
          <p className="text-sm text-muted-foreground">At Risk</p>
          <p className="text-2xl font-bold text-amber-600">
            {clients.filter((c) => c.status === "churnRisk").length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Paused</p>
          <p className="text-2xl font-bold">
            {clients.filter((c) => c.status === "paused").length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : clients.length > 0 ? (
        <ClientTable
          clients={clients}
          selectedId={selectedId}
          onSelect={handleSelectClient}
          onNudge={(client) => setNudgeClient(client)}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No clients found"
          description={
            query || filters.tags.length > 0
              ? "Try adjusting your search or filters"
              : "Start by adding your first client"
          }
          action={
            query || filters.tags.length > 0
              ? {
                  label: "Clear filters",
                  onClick: () => {
                    handleSearchChange("");
                    handleFiltersChange({
                      tags: [],
                      status: undefined,
                      riskMin: undefined,
                      riskMax: undefined,
                      hasNext: undefined,
                    });
                  },
                }
              : undefined
          }
        />
      )}

      <ClientInspector
        open={!!selectedId}
        onOpenChange={(open) => !open && handleCloseInspector()}
        client={selectedClient}
        loading={inspectorLoading}
        onNudge={() => selectedClient && setNudgeClient(selectedClient)}
        onUpdateTags={handleUpdateTags}
        onAddNote={handleAddNote}
      />

      <NudgeDialog
        open={!!nudgeClient}
        onOpenChange={(open) => !open && setNudgeClient(null)}
        client={nudgeClient}
        onSend={handleNudge}
      />
    </div>
  );
}
