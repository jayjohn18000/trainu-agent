import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { Users, Loader2 } from "lucide-react";

interface Program {
  id: string;
  name: string;
}

interface ProgramAssignDialogProps {
  program: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  program_id: string | null;
}

export function ProgramAssignDialog({ program, open, onOpenChange }: ProgramAssignDialogProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch trainer's clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ["contacts-for-assignment"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, email, program_id")
        .eq("trainer_id", user.id)
        .order("first_name", { ascending: true });

      if (error) throw error;
      return data as Contact[];
    },
    enabled: open,
  });

  // Mutation to assign program to clients
  const assignMutation = useMutation({
    mutationFn: async (clientIds: string[]) => {
      if (!program) throw new Error("No program selected");

      const { error } = await supabase
        .from("contacts")
        .update({ program_id: program.id })
        .in("id", clientIds);

      if (error) throw error;
      return clientIds.length;
    },
    onSuccess: (count) => {
      toast({
        title: "Program Assigned",
        description: `${program?.name} assigned to ${count} client${count > 1 ? "s" : ""}`,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      queryClient.invalidateQueries({ queryKey: ["contacts-for-assignment"] });
      setSelectedClients([]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign program. Please try again.",
        variant: "destructive",
      });
      console.error("Assign error:", error);
    },
  });

  const handleToggleClient = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (!clients) return;
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c.id));
    }
  };

  const handleAssign = () => {
    if (selectedClients.length === 0) return;
    assignMutation.mutate(selectedClients);
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return `${firstName[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Program</DialogTitle>
          <DialogDescription>
            Select clients to assign <span className="font-medium">{program?.name}</span> to.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : clients && clients.length > 0 ? (
          <>
            <div className="flex items-center justify-between py-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedClients.length === clients.length ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedClients.length} selected
              </span>
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {clients.map((client) => {
                  const isAlreadyAssigned = client.program_id === program?.id;
                  return (
                    <div
                      key={client.id}
                      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 ${
                        isAlreadyAssigned ? "opacity-50" : ""
                      }`}
                    >
                      <Checkbox
                        id={client.id}
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => handleToggleClient(client.id)}
                        disabled={isAlreadyAssigned}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(client.first_name, client.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <Label
                        htmlFor={client.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          {client.first_name} {client.last_name || ""}
                        </div>
                        {client.email && (
                          <div className="text-xs text-muted-foreground">
                            {client.email}
                          </div>
                        )}
                      </Label>
                      {isAlreadyAssigned && (
                        <Badge variant="secondary" className="text-xs">
                          Already assigned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No clients found. Add clients first to assign programs.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedClients.length === 0 || assignMutation.isPending}
          >
            {assignMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Assign to {selectedClients.length || ""} Client{selectedClients.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
