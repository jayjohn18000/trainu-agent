import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LearningStats {
  totalEdits: number;
  avgConfidence: number;
  topEditedTypes: Array<{ type: string; count: number }>;
  confidenceImprovement: number;
  recentActivity: Array<{ date: string; edits: number }>;
  editTypeBreakdown: Record<string, number>;
}

export function LearningAnalytics() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: edits, error } = await supabase
        .from('trainer_edits')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!edits || edits.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }

      // Calculate statistics
      const totalEdits = edits.length;
      const avgConfidence = edits.reduce((sum, e) => sum + (e.original_confidence || 0), 0) / totalEdits;

      // Edit type breakdown
      const editTypeBreakdown = edits.reduce((acc: Record<string, number>, edit) => {
        const type = edit.edit_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const topEditedTypes = Object.entries(editTypeBreakdown)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Calculate confidence trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEdits = edits.filter(e => new Date(e.created_at) > thirtyDaysAgo);
      const olderEdits = edits.filter(e => new Date(e.created_at) <= thirtyDaysAgo);
      
      const recentAvgConf = recentEdits.length > 0
        ? recentEdits.reduce((sum, e) => sum + (e.original_confidence || 0), 0) / recentEdits.length
        : avgConfidence;
      
      const olderAvgConf = olderEdits.length > 0
        ? olderEdits.reduce((sum, e) => sum + (e.original_confidence || 0), 0) / olderEdits.length
        : avgConfidence;
      
      const confidenceImprovement = recentAvgConf - olderAvgConf;

      // Recent activity by day
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const recentActivity = last7Days.map(date => ({
        date,
        edits: edits.filter(e => e.created_at.startsWith(date)).length
      }));

      setStats({
        totalEdits,
        avgConfidence,
        topEditedTypes,
        confidenceImprovement,
        recentActivity,
        editTypeBreakdown
      });
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalEdits === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Learning Analytics
          </CardTitle>
          <CardDescription>
            Track how the AI learns from your edits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No edits recorded yet. Start editing AI-generated messages to see learning analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatEditType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Learning Analytics
        </CardTitle>
        <CardDescription>
          AI has learned from {stats.totalEdits} edit{stats.totalEdits !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Trend */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Confidence Trend</span>
            <div className="flex items-center gap-1">
              {stats.confidenceImprovement >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-warning" />
              )}
              <span className={`text-sm font-medium ${
                stats.confidenceImprovement >= 0 ? 'text-success' : 'text-warning'
              }`}>
                {stats.confidenceImprovement >= 0 ? '+' : ''}
                {(stats.confidenceImprovement * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.confidenceImprovement >= 0 
              ? 'AI confidence is improving over time' 
              : 'AI is adapting to your editing patterns'}
          </p>
        </div>

        {/* Average Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Average Draft Confidence</span>
            <Badge variant={stats.avgConfidence >= 0.8 ? "default" : "secondary"}>
              {(stats.avgConfidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${stats.avgConfidence * 100}%` }}
            />
          </div>
        </div>

        {/* Most Edited Message Types */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Most Common Edit Types</span>
          </div>
          <div className="space-y-2">
            {stats.topEditedTypes.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatEditType(type)}
                </span>
                <Badge variant="outline">
                  {count} edit{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Type Breakdown */}
        <div>
          <span className="text-sm font-medium mb-3 block">Edit Patterns</span>
          <div className="space-y-2">
            {Object.entries(stats.editTypeBreakdown).map(([type, count]) => {
              const percentage = (count / stats.totalEdits) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{formatEditType(type)}</span>
                    <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className="bg-primary/60 rounded-full h-1.5 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <span className="text-sm font-medium mb-3 block">Last 7 Days Activity</span>
          <div className="flex items-end justify-between h-20 gap-1">
            {stats.recentActivity.map(({ date, edits }) => {
              const maxEdits = Math.max(...stats.recentActivity.map(a => a.edits), 1);
              const height = (edits / maxEdits) * 100;
              const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-secondary rounded-sm relative" style={{ height: '100%' }}>
                    {edits > 0 && (
                      <div 
                        className="absolute bottom-0 w-full bg-primary rounded-sm transition-all"
                        style={{ height: `${height}%` }}
                        title={`${edits} edits on ${dayLabel}`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
