import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useClientFilters } from "@/hooks/useClientFilters";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientSearch } from "@/components/clients/ClientSearch";
import { ClientFilters, ClientFiltersState } from "@/components/clients/ClientFilters";
import { ClientInspector } from "@/components/clients/ClientInspector";
import { NudgeDialog } from "@/components/clients/NudgeDialog";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { ClientsStats } from "@/components/clients/ClientsStats";
import { EmptyState } from "@/components/ui/empty-state";
import { Client, ClientDetail } from "@/lib/data/clients/types";
import { useClients } from "@/hooks/queries/useClients";
import { useClient } from "@/hooks/queries/useClient";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Users, Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

export default function Clients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [total, setTotal] = useState(0);

  const query = searchParams.get("q") || "";
  const selectedId = searchParams.get("id") || undefined;
  const sortBy = (searchParams.get("sort") as "name" | "risk" | "lastActivity") || "name";
  const sortDir = (searchParams.get("dir") as "asc" | "desc") || "asc";
  
  const { filters, updateFilters } = useClientFilters();

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const { data: clientsData, isLoading: clientsLoading } = useClients({
    q: query || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    status: filters.status,
    riskMin: filters.riskMin,
    riskMax: filters.riskMax,
    hasNext: filters.hasNext,
    sort: sortBy,
    dir: sortDir,
  });

  useEffect(() => {
    if (clientsData) {
      setClients(clientsData.items || []);
      setTotal(clientsData.total || 0);
    }
  }, [clientsData]);

  const { data: selectedClientData, isLoading: inspectorLoading } = useClient(selectedId);

  useEffect(() => {
    setSelectedClient(selectedClientData ?? null);
  }, [selectedClientData]);

  const handleSelectClient = useCallback((client: Client) => {
    updateURL({ id: client.id });
    analytics.track('client_viewed', { clientId: client.id });
  }, [updateURL]);

  const handleCloseInspector = useCallback(() => {
    updateURL({ id: undefined });
  }, [updateURL]);

  const handleSearchChange = useCallback((value: string) => {
    updateURL({ q: value || undefined });
  }, [updateURL]);

  const handleFiltersChange = useCallback((newFilters: ClientFiltersState) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleSort = useCallback((field: string) => {
    const newDir = sortBy === field && sortDir === "asc" ? "desc" : "asc";
    updateURL({ sort: field, dir: newDir });
  }, [sortBy, sortDir, updateURL]);


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
      },
    },
  ]);


  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 animate-fade-in" role="main" aria-label="Clients page">
      <ClientsHeader />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <ClientSearch value={query} onChange={handleSearchChange} />
        </div>
        <ClientFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      <ClientsStats clients={clients} total={total} />

      {clientsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : clients.length > 0 ? (
        <ClientTable
          clients={clients}
          selectedId={selectedId}
          onSelect={handleSelectClient}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })}
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
                    updateFilters({
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
      />
    </div>
  );
}
