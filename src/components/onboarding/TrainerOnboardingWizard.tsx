import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, User, Mail, Building2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface TrainerOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const trainerSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  location: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(1000).optional(),
});

type TrainerData = z.infer<typeof trainerSchema>;

export function TrainerOnboardingWizard({ open, onOpenChange }: TrainerOnboardingWizardProps) {
  const [step, setStep] = useState<"choice" | "manual" | "csv" | "success">("choice");
  const [formData, setFormData] = useState<TrainerData>({
    first_name: "",
    last_name: "",
    email: "",
    location: "",
    bio: "",
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleManualSubmit = async () => {
    try {
      setErrors({});
      const validatedData = trainerSchema.parse(formData);
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update trainer profile
      const { error } = await supabase
        .from('trainer_profiles')
        .update({
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          email: validatedData.email,
          location: validatedData.location || "",
          bio: validatedData.bio || "",
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your trainer profile has been set up successfully!",
      });

      setStep("success");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must have at least a header row and one data row");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['first_name', 'last_name', 'email'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const trainers: TrainerData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const trainer: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          trainer[header] = values[index] || '';
        });

        try {
          const validatedTrainer = trainerSchema.parse(trainer);
          trainers.push(validatedTrainer);
        } catch (error) {
          console.error(`Invalid data in row ${i + 1}:`, error);
        }
      }

      if (trainers.length === 0) {
        throw new Error("No valid trainer data found in CSV");
      }

      // For now, just update the current user's profile with the first entry
      // In a full implementation, this would create multiple trainer accounts
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const firstTrainer = trainers[0];
      const { error } = await supabase
        .from('trainer_profiles')
        .update({
          first_name: firstTrainer.first_name,
          last_name: firstTrainer.last_name,
          email: firstTrainer.email,
          location: firstTrainer.location || "",
          bio: firstTrainer.bio || "",
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Import successful",
        description: `Imported ${trainers.length} trainer(s) from CSV`,
      });

      setStep("success");
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import CSV",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("choice");
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      location: "",
      bio: "",
    });
    setCsvFile(null);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "choice" && "Set Up Your Trainer Profile"}
            {step === "manual" && "Enter Your Information"}
            {step === "csv" && "Import Trainers from CSV"}
            {step === "success" && "Setup Complete!"}
          </DialogTitle>
        </DialogHeader>

        {step === "choice" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-4 p-6"
              onClick={() => setStep("manual")}
            >
              <User className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold mb-1">Manual Entry</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your information manually
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center gap-4 p-6"
              onClick={() => setStep("csv")}
            >
              <Upload className="h-12 w-12 text-primary" />
              <div className="text-center">
                <h3 className="font-semibold mb-1">Import CSV</h3>
                <p className="text-sm text-muted-foreground">
                  Upload trainer data from a spreadsheet
                </p>
              </div>
            </Button>
          </div>
        )}

        {step === "manual" && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="New York, NY"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your training experience..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep("choice")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleManualSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {step === "csv" && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with columns: first_name, last_name, email, location (optional), bio (optional)
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="max-w-xs mx-auto"
              />
              {csvFile && (
                <p className="text-sm text-primary mt-2">Selected: {csvFile.name}</p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">CSV Format Example:</h4>
              <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`first_name,last_name,email,location,bio
John,Doe,john@example.com,New York NY,Certified trainer
Jane,Smith,jane@example.com,Los Angeles CA,10 years experience`}
              </pre>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep("choice")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're All Set!</h3>
            <p className="text-muted-foreground mb-6">
              Your trainer profile has been configured successfully.
            </p>
            <Button onClick={handleClose}>Get Started</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
