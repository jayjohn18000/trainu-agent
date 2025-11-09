import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { importContacts } from "@/lib/api/ghl";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  onNext: () => void;
  onSkip: () => void;
  onImport: (data: { contactsImported: boolean }) => void;
};

export function ContactImportStep({ onNext, onSkip, onImport }: Props) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [contactCount, setContactCount] = useState(0);
  const { toast } = useToast();

  const parseCSV = (text: string): Array<{ first_name: string; last_name: string; email?: string; phone?: string }> => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have headers and at least one row');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const firstNameIdx = headers.findIndex(h => h.includes('first'));
    const lastNameIdx = headers.findIndex(h => h.includes('last'));
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const phoneIdx = headers.findIndex(h => h.includes('phone'));

    if (firstNameIdx === -1) throw new Error('CSV must have a "first name" column');

    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const firstName = values[firstNameIdx];
      if (!firstName) continue;

      contacts.push({
        first_name: firstName,
        last_name: lastNameIdx !== -1 ? values[lastNameIdx] || '' : '',
        email: emailIdx !== -1 ? values[emailIdx] || undefined : undefined,
        phone: phoneIdx !== -1 ? values[phoneIdx] || undefined : undefined,
      });
    }

    return contacts;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const contacts = parseCSV(text);
      setContactCount(contacts.length);

      await importContacts(contacts);
      
      onImport({ contactsImported: true });
      toast({
        title: "Contacts imported",
        description: `Successfully imported ${contacts.length} contacts`,
      });
      
      setTimeout(onNext, 1500);
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import contacts",
        variant: "destructive",
      });
      setFileName(null);
      setContactCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Import your existing client contacts to get started faster. We'll use this to help you engage with your clients.
        </AlertDescription>
      </Alert>

      <Card className="p-6 border-2 border-dashed hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Upload Contact CSV</h3>
            <p className="text-sm text-muted-foreground">
              CSV should include columns: first_name, last_name, email, phone
            </p>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{fileName}</span>
              <span className="text-primary font-medium">({contactCount} contacts)</span>
            </div>
          )}

          <label htmlFor="csv-upload">
            <Button 
              variant="outline" 
              disabled={loading}
              asChild
            >
              <span className="cursor-pointer">
                {loading ? "Importing..." : "Choose File"}
              </span>
            </Button>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </Card>

      <Alert variant="default" className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Don't have a CSV?</strong> You can skip this step and add contacts later manually.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
