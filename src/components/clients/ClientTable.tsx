import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Client } from "@/lib/data/clients/types";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowUpDown, Eye, MoreVertical, Copy, ExternalLink } from "lucide-react";
import { resolveGhlLink } from "@/lib/ghl/links";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { getRiskVariant, statusBadgeVariants } from "@/lib/design-system/colors";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { clientProvider } from "@/lib/data/clients/provider";
import { useCallback } from "react";
import { StreakCell } from "./StreakCell";
import { ProgramSelector } from "./ProgramSelector";
import { TagPickerPopover } from "./TagPickerPopover";
import { useAssignProgram, useUpdateClientTagsInline } from "@/hooks/mutations/useClientMutations";

interface ExtendedClient extends Client {
  current_streak?: number;
  last_checkin_at?: string | null;
}

interface ClientTableProps {
  clients: ExtendedClient[];
  selectedId?: string;
  onSelect: (client: Client) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort: (field: string) => void;
  onRefresh?: () => void;
}

function getRiskBadge(risk: number) {
  const variant = getRiskVariant(risk);
  const label = variant.charAt(0).toUpperCase() + variant.slice(1);
  return (
    <Badge variant="outline" className={statusBadgeVariants[variant === 'low' ? 'success' : variant === 'medium' ? 'warning' : 'danger']}>
      {label}
    </Badge>
  );
}

function getStatusBadge(status: Client["status"]) {
  const variants: Record<Client["status"], { label: string; className: string }> = {
    active: { label: "Active", className: statusBadgeVariants.active },
    paused: { label: "Paused", className: statusBadgeVariants.paused },
    churnRisk: { label: "At Risk", className: statusBadgeVariants.churnRisk },
  };
  const variant = variants[status];
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

export function ClientTable({
  clients,
  selectedId,
  onSelect,
  sortBy,
  sortDir,
  onSort,
  onRefresh,
}: ClientTableProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const assignProgram = useAssignProgram();
  const updateTags = useUpdateClientTagsInline();

  const handleRowHover = useCallback((clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.clients.detail(clientId),
      queryFn: () => clientProvider.get(clientId),
      staleTime: 60000, // Prefetch is valid for 1 minute
    });
  }, [queryClient]);

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const handleCopyLink = (clientId: string) => {
    const url = `${window.location.origin}/clients?id=${clientId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Client link copied to clipboard" });
  };

  const handleEditInGHL = async (client: Client) => {
    const result = await resolveGhlLink({
      type: 'conversations',
      ids: { contactId: client.id },
    });
    
    if (result.disabled) {
      toast({
        title: "Cannot open GHL",
        description: result.reason || "Missing GHL configuration",
        variant: "destructive",
      });
      return;
    }
    
    if (result.url) {
      window.open(result.url, '_blank');
    }
  };

  // Desktop table view
  const tableView = (
    <div className="hidden md:block rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">Client</SortButton>
            </TableHead>
            <TableHead>Streak</TableHead>
            <TableHead>
              <SortButton field="risk">Risk</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="lastActivity">Last Activity</SortButton>
            </TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Next Session</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow
              key={client.id}
              data-testid="client-row"
              className={`cursor-pointer ${
                selectedId === client.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelect(client)}
              onMouseEnter={() => handleRowHover(client.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                    <AvatarFallback>
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium capitalize">{client.name}</div>
                    {client.email && (
                      <div className="text-sm text-muted-foreground">{client.email}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <StreakCell
                  clientId={client.id}
                  currentStreak={client.current_streak ?? 0}
                  lastCheckinAt={client.last_checkin_at ?? null}
                  onCheckinComplete={onRefresh}
                />
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>{getRiskBadge(client.risk)}</TooltipTrigger>
                    <TooltipContent>Risk Score: {client.risk}/100</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(client.lastActivity), { addSuffix: true })}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ProgramSelector
                  value={client.program_id}
                  onChange={(programId) => assignProgram.mutate({ clientId: client.id, programId })}
                  disabled={assignProgram.isPending}
                />
              </TableCell>
              <TableCell className="text-sm">
                {client.nextSession ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        {formatDistanceToNow(new Date(client.nextSession), { addSuffix: true })}
                      </TooltipTrigger>
                      <TooltipContent>
                        {format(new Date(client.nextSession), "PPp")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 flex-wrap items-center max-w-[200px]">
                  {client.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                  <TagPickerPopover
                    tags={client.tags}
                    onSave={(tags) => updateTags.mutate({ id: client.id, tags })}
                    disabled={updateTags.isPending}
                  />
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelect(client)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditInGHL(client)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Edit in GHL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyLink(client.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile card view
  const cardView = (
    <div className="md:hidden space-y-3">
      {clients.map((client) => (
        <Card
          key={client.id}
          data-testid="client-row"
          className={`p-4 cursor-pointer transition-colors ${
            selectedId === client.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelect(client)}
          onMouseEnter={() => handleRowHover(client.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={client.avatarUrl} alt={client.name} />
                <AvatarFallback>
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold capitalize">{client.name}</div>
                <div className="text-sm text-muted-foreground">{client.email}</div>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSelect(client)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditInGHL(client)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit in GHL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyLink(client.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div onClick={(e) => e.stopPropagation()}>
              <span className="text-muted-foreground">Streak:</span>{" "}
              <StreakCell
                clientId={client.id}
                currentStreak={client.current_streak ?? 0}
                lastCheckinAt={client.last_checkin_at ?? null}
                onCheckinComplete={onRefresh}
              />
            </div>
            <div>
              <span className="text-muted-foreground">Risk:</span> {getRiskBadge(client.risk)}
            </div>
            <div>
              <span className="text-muted-foreground">Last:</span>{" "}
              {formatDistanceToNow(new Date(client.lastActivity), { addSuffix: true })}
            </div>
            <div>
              <span className="text-muted-foreground">Next:</span>{" "}
              {client.nextSession
                ? formatDistanceToNow(new Date(client.nextSession), { addSuffix: true })
                : "—"}
            </div>
          </div>

          <div className="text-sm mb-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-muted-foreground">Program:</span>{" "}
            <ProgramSelector
              value={client.program_id}
              onChange={(programId) => assignProgram.mutate({ clientId: client.id, programId })}
              disabled={assignProgram.isPending}
            />
          </div>

          <div className="flex gap-1 flex-wrap items-center" onClick={(e) => e.stopPropagation()}>
            {client.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            <TagPickerPopover
              tags={client.tags}
              onSave={(tags) => updateTags.mutate({ id: client.id, tags })}
              disabled={updateTags.isPending}
            />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      {tableView}
      {cardView}
    </>
  );
}
