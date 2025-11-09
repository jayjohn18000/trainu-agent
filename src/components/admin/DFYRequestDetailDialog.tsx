import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateGHLConfigStatus, getGHLConfigForTrainer, DFYRequestWithTrainer } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Building2, Mail, Phone, CheckCircle2, AlertCircle } from "lucide-react";

type Props = {
  request: DFYRequestWithTrainer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DFYRequestDetailDialog({ request, open, onOpenChange }: Props) {
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ghlConfig } = useQuery({
    queryKey: ['ghl-config', request.trainer_id],
    queryFn: () => getGHLConfigForTrainer(request.trainer_id),
    enabled: open,
  });

  const updateConfigMutation = useMutation({
    mutationFn: (status: 'pending' | 'in_progress' | 'completed' | 'failed') =>
      updateGHLConfigStatus(request.trainer_id, status, adminNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dfy-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-config', request.trainer_id] });
      toast({
        title: "Configuration updated",
        description: "GHL configuration has been updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>DFY Request Details</DialogTitle>
          <DialogDescription>
            Manage this trainer's GoHighLevel setup request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Business Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{request.business_name}</p>
                <p className="text-sm text-muted-foreground">Business Name</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{request.email}</p>
                <p className="text-sm text-muted-foreground">Email</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{request.phone}</p>
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge>
                  {request.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {request.status || 'pending'}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Has Existing GHL Account</Label>
              <p className="mt-1 font-medium">
                {request.current_ghl_account === 'true' ? 'Yes' : 'No'}
              </p>
            </div>

            {request.additional_notes && (
              <div>
                <Label className="text-muted-foreground">Additional Notes</Label>
                <p className="mt-1 text-sm">{request.additional_notes}</p>
              </div>
            )}

            <div>
              <Label className="text-muted-foreground">Submitted</Label>
              <p className="mt-1 text-sm">
                {format(new Date(request.created_at || ''), 'PPpp')}
              </p>
            </div>

            {request.updated_at && request.updated_at !== request.created_at && (
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="mt-1 text-sm">
                  {format(new Date(request.updated_at), 'PPpp')}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* GHL Config Status */}
          {ghlConfig && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/50">
              <h4 className="font-semibold">GHL Configuration</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-muted-foreground">Provisioning Status</Label>
                  <p className="mt-1 font-medium">{ghlConfig.provisioning_status}</p>
                </div>
                {ghlConfig.location_id && (
                  <div>
                    <Label className="text-muted-foreground">Location ID</Label>
                    <p className="mt-1 font-mono text-xs">{ghlConfig.location_id}</p>
                  </div>
                )}
                {ghlConfig.provisioned_at && (
                  <div>
                    <Label className="text-muted-foreground">Provisioned At</Label>
                    <p className="mt-1 text-xs">
                      {format(new Date(ghlConfig.provisioned_at), 'PPpp')}
                    </p>
                  </div>
                )}
              </div>
              {ghlConfig.admin_notes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="mt-1 text-sm">{ghlConfig.admin_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin Actions */}
          <div className="space-y-3">
            <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about the provisioning process..."
              rows={3}
            />
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => updateConfigMutation.mutate('in_progress')}
                disabled={updateConfigMutation.isPending}
              >
                Mark In Progress
              </Button>
              <Button
                variant="destructive"
                onClick={() => updateConfigMutation.mutate('failed')}
                disabled={updateConfigMutation.isPending}
              >
                Mark Failed
              </Button>
              <Button
                onClick={() => updateConfigMutation.mutate('completed')}
                disabled={updateConfigMutation.isPending}
              >
                Mark Completed
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
