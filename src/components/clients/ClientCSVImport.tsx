import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface ClientCSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const clientSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  tags: z.string().trim().optional(),
});

type ClientData = z.infer<typeof clientSchema>;

// Normalize CSV headers to handle various formats
const normalizeHeader = (header: string): string => {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')                    // "First Name" → "first_name"
    .replace(/email\s*address/i, 'email')    // "Email Address" → "email"
    .replace(/phone\s*number/i, 'phone')     // "Phone Number" → "phone"
    .replace(/([a-z])([A-Z])/g, '$1_$2')    // camelCase → snake_case
    .toLowerCase();
};

export function ClientCSVImport({ open, onOpenChange, onSuccess }: ClientCSVImportProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"upload" | "success">("upload");

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

      const headers = lines[0].split(',').map(h => normalizeHeader(h));
      const requiredHeaders = ['first_name', 'last_name', 'email'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}. Found: ${headers.join(', ')}`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const clients: ClientData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const client: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          client[header] = values[index] || '';
        });

        try {
          const validatedClient = clientSchema.parse(client);
          clients.push(validatedClient);
        } catch (error) {
          console.error(`Invalid data in row ${i + 1}:`, error);
        }
      }

      if (clients.length === 0) {
        throw new Error("No valid client data found in CSV");
      }

      // Insert clients into database
      const clientsToInsert = clients.map(client => ({
        trainer_id: user.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone || null,
        tags: client.tags ? client.tags.split(';').map(t => t.trim()).filter(Boolean) : [],
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(clientsToInsert);

      if (error) throw error;

      toast({
        title: "Import successful",
        description: `Imported ${clients.length} client(s) from CSV`,
      });

      setStep("success");
      onSuccess?.();
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
    setStep("upload");
    setCsvFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && "Import Clients from CSV"}
            {step === "success" && "Import Complete!"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with columns: first_name (or First Name), last_name (or Last Name), email, phone (optional), tags (optional, semicolon-separated)
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
              <h4 className="font-semibold text-sm mb-2">CSV Format Examples (both work!):</h4>
              <pre className="text-xs bg-background p-3 rounded overflow-x-auto mb-2">
{`first_name,last_name,email,phone,tags
John,Doe,john@example.com,555-0100,VIP;Active
Jane,Smith,jane@example.com,555-0200,New Client`}
              </pre>
              <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`First Name,Last Name,Email,Phone,Tags
John,Doe,john@example.com,555-0100,VIP;Active
Jane,Smith,jane@example.com,555-0200,New Client`}
              </pre>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Importing..." : "Import Clients"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Clients Imported!</h3>
            <p className="text-muted-foreground mb-6">
              Your clients have been successfully imported and are now available.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
