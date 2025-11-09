import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDFYRequests, updateDFYRequestStatus, DFYRequestWithTrainer } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DFYRequestDetailDialog } from "./DFYRequestDetailDialog";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "all" | "pending" | "in_progress" | "completed" | "failed";

export function DFYRequestsTable() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<DFYRequestWithTrainer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-dfy-requests'],
    queryFn: getAllDFYRequests,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: any }) =>
      updateDFYRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dfy-requests'] });
      toast({
        title: "Status updated",
        description: "Request status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests?.filter(
    (req) => statusFilter === "all" || req.status === statusFilter
  );

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      pending: { variant: "secondary" as const, label: "Pending" },
      in_progress: { variant: "default" as const, label: "In Progress" },
      completed: { variant: "default" as const, label: "Completed" },
      failed: { variant: "destructive" as const, label: "Failed" },
    };

    const config = statusMap[status as keyof typeof statusMap] || {
      variant: "secondary" as const,
      label: status || "Unknown",
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">DFY Requests</h3>
            <p className="text-sm text-muted-foreground">
              Manage GoHighLevel setup requests from trainers
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredRequests?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests found
            </div>
          ) : (
            filteredRequests?.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{request.business_name}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{request.email}</span>
                      <span>•</span>
                      <span>{request.phone}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(request.created_at || ''), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={request.status || "pending"}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({
                        requestId: request.id,
                        status: value,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {selectedRequest && (
        <DFYRequestDetailDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        />
      )}
    </>
  );
}
