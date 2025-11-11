import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export default function AdminVerifications() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["trainer-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainer_verification_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      requestId,
      action,
      reason,
    }: {
      requestId: string;
      action: "approve" | "reject";
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("verify-trainer-claim", {
        body: { requestId, action, rejectionReason: reason },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-verifications"] });
      setSelectedRequest(null);
      setRejectionReason("");
      toast.success("Verification request processed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process request");
    },
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status !== "pending");

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Trainer Verification Requests</h1>
        <p className="text-muted-foreground">Review and approve trainer profile claims</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pending Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending requests
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{request.trainer_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {request.trainer_city}, {request.trainer_state}
                        </p>
                      </div>
                      <Badge>{request.verification_method}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Email:</span> {request.claimed_by_email}
                        </div>
                        <div>
                          <span className="font-semibold">Submitted:</span>{" "}
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {request.proof_description && (
                        <div>
                          <span className="font-semibold text-sm">Description:</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.proof_description}
                          </p>
                        </div>
                      )}

                      {request.proof_media_urls?.length > 0 && (
                        <div>
                          <span className="font-semibold text-sm">Proof Files:</span>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {request.proof_media_urls.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                File {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            verifyMutation.mutate({ requestId: request.id, action: "approve" })
                          }
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedRequest(request)}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Reviewed Requests ({reviewedRequests.length})
          </h2>
          <div className="grid gap-4">
            {reviewedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.trainer_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.trainer_city}, {request.trainer_state}
                      </p>
                    </div>
                    <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Reviewed on {new Date(request.reviewed_at).toLocaleDateString()}
                    {request.rejection_reason && (
                      <div className="mt-2">
                        <span className="font-semibold">Reason:</span> {request.rejection_reason}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Rejection Reason</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    toast.error("Please provide a rejection reason");
                    return;
                  }
                  verifyMutation.mutate({
                    requestId: selectedRequest.id,
                    action: "reject",
                    reason: rejectionReason,
                  });
                }}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
