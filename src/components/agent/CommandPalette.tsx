import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Home, Users, Settings, Search, Pause, Play, CheckCheck } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients?: Array<{ id: string; name: string }>;
  onPauseAgent?: () => void;
  onApproveAllSafe?: () => void;
  isPaused?: boolean;
}

export function CommandPalette({
  open,
  onOpenChange,
  clients = [],
  onPauseAgent,
  onApproveAllSafe,
  isPaused = false,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Listen for Cmd/Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      callback();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search clients or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/today"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Open Today</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/clients"))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Open Clients</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          {onPauseAgent && (
            <CommandItem
              onSelect={() => handleSelect(onPauseAgent)}
            >
              {isPaused ? (
                <Play className="mr-2 h-4 w-4" />
              ) : (
                <Pause className="mr-2 h-4 w-4" />
              )}
              <span>{isPaused ? "Resume agent" : "Pause agent"}</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
                P
              </kbd>
            </CommandItem>
          )}
          {onApproveAllSafe && (
            <CommandItem
              onSelect={() => handleSelect(onApproveAllSafe)}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              <span>Approve all safe</span>
            </CommandItem>
          )}
        </CommandGroup>

        {filteredClients.length > 0 && (
          <CommandGroup heading="Clients">
            {filteredClients.slice(0, 5).map((client) => (
              <CommandItem
                key={client.id}
                onSelect={() =>
                  handleSelect(() => navigate(`/clients?id=${client.id}`))
                }
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{client.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
