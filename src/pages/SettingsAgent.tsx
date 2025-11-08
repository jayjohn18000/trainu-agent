import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MESSAGE_TEMPLATES, type TemplateId } from "@/lib/constants/messageTemplates";

interface TemplateData {
  id: string;
  name: string;
  content: string;
  description: string;
}

export default function SettingsAgent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: customTemplates } = await supabase
        .from("message_templates")
        .select("*")
        .eq("trainer_id", user.id);

      // Merge custom templates with defaults
      const templateMap = new Map<string, TemplateData>();
      
      // Add defaults
      Object.entries(MESSAGE_TEMPLATES).forEach(([key, template]) => {
        templateMap.set(template.id, {
          id: template.id,
          name: template.name,
          content: template.content,
          description: template.description,
        });
      });

      // Override with custom templates
      customTemplates?.forEach((custom) => {
        templateMap.set(custom.template_id, {
          id: custom.template_id,
          name: custom.name || MESSAGE_TEMPLATES[custom.template_id as TemplateId]?.name || "Custom",
          content: custom.content,
          description: custom.description || MESSAGE_TEMPLATES[custom.template_id as TemplateId]?.description || "",
        });
      });

      setTemplates(Array.from(templateMap.values()));
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast({
        title: "Error loading templates",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (templateId: string, content: string) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const template = MESSAGE_TEMPLATES[templateId as TemplateId];
      
      await supabase
        .from("message_templates")
        .upsert({
          trainer_id: user.id,
          template_id: templateId,
          name: template.name,
          content: content.trim(),
          description: template.description,
          channel: template.channel,
        }, {
          onConflict: "trainer_id,template_id",
        });

      toast({
        title: "Template saved",
        description: "Your changes have been saved successfully",
      });
      
      setEditingId(null);
      loadTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("message_templates")
        .delete()
        .eq("trainer_id", user.id)
        .eq("template_id", templateId);

      toast({
        title: "Template reset",
        description: "Template restored to default",
      });
      
      loadTemplates();
    } catch (error) {
      console.error("Failed to reset template:", error);
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 max-w-[1200px]">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/today")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Message Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize AI message templates used for drafts
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Template Variables</p>
          <p>Use these placeholders: <code className="text-xs bg-background px-1 py-0.5 rounded">{'{{first_name}}'}</code>, <code className="text-xs bg-background px-1 py-0.5 rounded">{'{{studio_name}}'}</code>, <code className="text-xs bg-background px-1 py-0.5 rounded">{'{{reschedule_url}}'}</code></p>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading templates...</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  {editingId === template.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const content = (document.getElementById(`template-${template.id}`) as HTMLTextAreaElement)?.value;
                          handleSave(template.id, content);
                        }}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset(template.id)}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setEditingId(template.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === template.id ? (
                  <Textarea
                    id={`template-${template.id}`}
                    defaultValue={template.content}
                    rows={4}
                    className="resize-none font-mono text-sm"
                  />
                ) : (
                  <div className="p-4 rounded-lg bg-muted/30 font-mono text-sm">
                    {template.content}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
