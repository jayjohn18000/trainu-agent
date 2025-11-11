import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Mail, Shield } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerKey: string;
  trainerName: string;
  trainerCity?: string;
  trainerState?: string;
};

type VerificationMethod = "email" | "ghl_oauth" | "social_proof";

export function TrainerClaimModal({
  open,
  onOpenChange,
  trainerKey,
  trainerName,
  trainerCity,
  trainerState,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<VerificationMethod | null>(null);
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3);
      setFiles(newFiles);
    }
  };

  const handleSubmit = async () => {
    if (!email || !method) {
      toast.error("Please complete all required fields");
      return;
    }

    setUploading(true);

    try {
      let proofMediaUrls: string[] = [];

      // Upload files if using social_proof method
      if (method === "social_proof" && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${trainerKey}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("trainer-verification")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("trainer-verification")
            .getPublicUrl(filePath);

          return urlData.publicUrl;
        });

        proofMediaUrls = await Promise.all(uploadPromises);
      }

      // Submit claim request
      const { data, error } = await supabase.functions.invoke("claim-trainer-profile", {
        body: {
          trainerKey,
          trainerName,
          trainerCity,
          trainerState,
          email,
          verificationMethod: method,
          proofMediaUrls,
          proofDescription: description,
          ipAddress: "", // Client IP would be captured server-side
          deviceFingerprint: navigator.userAgent,
        },
      });

      if (error) throw error;

      if (data?.status === "approved") {
        toast.success("Profile verified instantly! You're all set.");
      } else {
        toast.success("Verification request submitted! We'll review it soon.");
      }

      setStep(3);
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      toast.error(error.message || "Failed to submit verification request");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Your Trainer Profile</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Claiming <strong>{trainerName}</strong> profile. Choose how you'd like to verify:
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  setMethod("ghl_oauth");
                  setStep(2);
                }}
              >
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">TrainU Account (Instant)</div>
                    <div className="text-xs text-muted-foreground">
                      If you're a TrainU customer, verify instantly with OAuth
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  setMethod("social_proof");
                  setStep(2);
                }}
              >
                <div className="flex items-start gap-3">
                  <Upload className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Social Proof (Manual Review)</div>
                    <div className="text-xs text-muted-foreground">
                      Upload photos/videos of you training clients
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  setMethod("email");
                  setStep(2);
                }}
              >
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-left">
                    <div className="font-semibold">Email Verification</div>
                    <div className="text-xs text-muted-foreground">
                      If your email matches our records, auto-approve
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            {method === "social_proof" && (
              <>
                <div>
                  <Label htmlFor="proof-files">Upload Proof (1-3 files) *</Label>
                  <Input
                    id="proof-files"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload photos/videos showing you training clients, business card, or social
                    media profile
                  </p>
                  {files.length > 0 && (
                    <div className="mt-2 text-sm">
                      {files.length} file(s) selected
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief explanation of the proof you're providing..."
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
                {uploading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="font-semibold mb-2">Request Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                {method === "ghl_oauth"
                  ? "Your profile has been verified instantly."
                  : "We'll review your verification request and notify you via email."}
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
