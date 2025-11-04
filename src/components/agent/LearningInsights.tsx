import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, TrendingUp, Edit3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditStats {
  totalEdits: number;
  avgConfidence: number;
  topEditedTypes: { type: string; count: number }[];
  confidenceImprovement: number;
}

export function LearningInsights() {
  const [stats, setStats] = useState<EditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get edit history
      const { data: edits, error } = await supabase
        .from("trainer_edits")
        .select("edit_type, original_confidence, created_at")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (edits && edits.length > 0) {
        // Calculate stats
        const totalEdits = edits.length;
        const avgConfidence = edits.reduce((sum, e) => sum + (e.original_confidence || 0), 0) / totalEdits;

        // Count edit types
        const typeCounts = edits.reduce((acc, e) => {
          acc[e.edit_type] = (acc[e.edit_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topEditedTypes = Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Calculate confidence improvement (compare last 20 vs previous 20)
        const recentConfidence = edits.slice(0, 20).reduce((sum, e) => sum + (e.original_confidence || 0), 0) / Math.min(20, edits.length);
        const olderConfidence = edits.slice(20, 40).reduce((sum, e) => sum + (e.original_confidence || 0), 0) / Math.min(20, edits.slice(20, 40).length);
        const confidenceImprovement = edits.length >= 40 ? ((recentConfidence - olderConfidence) / olderConfidence) * 100 : 0;

        setStats({
          totalEdits,
          avgConfidence,
          topEditedTypes,
          confidenceImprovement,
        });
      }
    } catch (error) {
      console.error("Failed to load learning insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading insights...
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalEdits === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Learning Insights
          </CardTitle>
          <CardDescription>
            The AI learns from your edits to improve future drafts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No edits yet. The AI will learn from your feedback as you edit drafts.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Learning Insights
        </CardTitle>
        <CardDescription>
          The AI is learning from your {stats.totalEdits} edits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Improvement */}
        {stats.confidenceImprovement !== 0 && (
          <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-sm">Confidence Improving</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {stats.confidenceImprovement > 0 ? '+' : ''}{stats.confidenceImprovement.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Recent drafts vs. earlier drafts
              </div>
            </div>
          </div>
        )}

        {/* Average Confidence */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Avg. Confidence of Edited Messages</div>
          <div className="text-lg font-semibold">
            {Math.round(stats.avgConfidence * 100)}%
          </div>
        </div>

        {/* Top Edited Types */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Most Edited Message Types
          </div>
          <div className="space-y-2">
            {stats.topEditedTypes.map((type, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{idx + 1}
                  </Badge>
                  <span className="text-sm capitalize">
                    {type.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {type.count} edits
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The AI adjusts confidence lower for these message types
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
