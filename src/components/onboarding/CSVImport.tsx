import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CSVImportProps {
  onImportComplete: (count: number) => void;
}

interface ColumnMapping {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  tags: string;
}

interface PreviewRow {
  [key: string]: string;
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    tags: "",
  });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = "First Name,Last Name,Phone,Email,Tags\nJohn,Doe,555-0100,john@example.com,active\nJane,Smith,555-0101,jane@example.com,new";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Template downloaded", description: "Fill in your client data and upload" });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        toast({
          title: "Empty file",
          description: "CSV must have headers and at least one data row",
          variant: "destructive",
        });
        return;
      }

      const csvHeaders = lines[0].split(",").map((h) => h.trim());
      setHeaders(csvHeaders);

      // Parse preview rows (first 5)
      const rows: PreviewRow[] = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: PreviewRow = {};
        csvHeaders.forEach((header, idx) => {
          row[header] = values[idx] || "";
        });
        rows.push(row);
      }
      setPreviewRows(rows);

      // Auto-map common column names
      const autoMapping: ColumnMapping = {
        firstName: csvHeaders.find((h) => /first.*name/i.test(h)) || "",
        lastName: csvHeaders.find((h) => /last.*name/i.test(h)) || "",
        phone: csvHeaders.find((h) => /phone/i.test(h)) || "",
        email: csvHeaders.find((h) => /email/i.test(h)) || "",
        tags: csvHeaders.find((h) => /tag/i.test(h)) || "",
      };
      setMapping(autoMapping);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file || !mapping.firstName || !mapping.phone) {
      toast({
        title: "Missing mappings",
        description: "At minimum, map First Name and Phone",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const csvHeaders = lines[0].split(",").map((h) => h.trim());

        const firstNameIdx = csvHeaders.indexOf(mapping.firstName);
        const lastNameIdx = csvHeaders.indexOf(mapping.lastName);
        const phoneIdx = csvHeaders.indexOf(mapping.phone);
        const emailIdx = csvHeaders.indexOf(mapping.email);
        const tagsIdx = mapping.tags ? csvHeaders.indexOf(mapping.tags) : -1;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const contacts = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const firstName = values[firstNameIdx] || "";
          const lastName = lastNameIdx >= 0 ? values[lastNameIdx] : "";
          const phone = values[phoneIdx] || "";
          const email = emailIdx >= 0 ? values[emailIdx] : "";
          const tags = tagsIdx >= 0 && values[tagsIdx] ? [values[tagsIdx]] : [];

          if (firstName && phone) {
            contacts.push({
              trainer_id: user.id,
              first_name: firstName,
              last_name: lastName,
              phone,
              email: email || null,
              tags,
            });
          }
        }

        const { error } = await supabase.from("contacts").insert(contacts);
        if (error) throw error;

        toast({
          title: "Import complete",
          description: `Successfully imported ${contacts.length} clients`,
        });

        onImportComplete(contacts.length);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={downloadTemplate} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </Button>
      </div>

      {file && (
        <>
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-medium text-sm">{file.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {previewRows.length} row(s) preview shown below
            </p>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Map Columns</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Select value={mapping.firstName} onValueChange={(v) => setMapping({ ...mapping, firstName: v })}>
                  <SelectTrigger id="firstName">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Select value={mapping.lastName} onValueChange={(v) => setMapping({ ...mapping, lastName: v })}>
                  <SelectTrigger id="lastName">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Select value={mapping.phone} onValueChange={(v) => setMapping({ ...mapping, phone: v })}>
                  <SelectTrigger id="phone">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Select value={mapping.email} onValueChange={(v) => setMapping({ ...mapping, email: v })}>
                  <SelectTrigger id="email">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <Select value={mapping.tags} onValueChange={(v) => setMapping({ ...mapping, tags: v })}>
                  <SelectTrigger id="tags">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {previewRows.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {headers.map((h) => (
                        <th key={h} className="text-left p-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {headers.map((h) => (
                          <td key={h} className="p-2">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Button onClick={handleImport} disabled={importing || !mapping.firstName || !mapping.phone} className="w-full">
            {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Import {previewRows.length} Client{previewRows.length !== 1 ? "s" : ""}
          </Button>
        </>
      )}
    </div>
  );
}
