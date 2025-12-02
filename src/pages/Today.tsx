import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getFeed } from "@/lib/api/agent";
import { listDraftsAndQueued, approveMessage, sendNow } from "@/lib/api/messages";
import { QueueCard } from "@/components/agent/QueueCard";
import { ActivityFeed } from "@/components/agent/ActivityFeed";
import { MessageEditor } from "@/components/agent/MessageEditor";
import { InsightCard } from "@/components/agent/InsightCard";
import { getRecentInsightsWithDrafts } from "@/lib/api/events";
import { CalendarWidget } from "@/components/agent/CalendarWidget";
import { AtRiskWidget } from "@/components/agent/AtRiskWidget";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { Confetti } from "@/components/effects/Confetti";
import { ActivityFeedSkeleton } from "@/components/skeletons/ActivityFeedSkeleton";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { MessagesModal } from "@/components/modals/MessagesModal";
import { KeyboardShortcutsOverlay } from "@/components/navigation/KeyboardShortcutsOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { useAchievementTracker } from "@/hooks/useAchievementTracker";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTrainerDashboardStats } from "@/hooks/queries/useTrainerDashboardStats";
import { useUpcomingSessions } from "@/hooks/queries/useUpcomingSessions";
import { useRecentUpdates } from "@/hooks/queries/useRecentUpdates";
import { useTrainerROIMetrics } from "@/hooks/queries/useTrainerROIMetrics";
import { TrainerXPNotification } from "@/components/gamification/TrainerXPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceTrendChart } from "@/components/dashboard/ComplianceTrendChart";
import { QuickActionsPills } from "@/components/dashboard/QuickActionsPills";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { RecentUpdates } from "@/components/dashboard/RecentUpdates";
import { markTourComplete, shouldShowAiTour } from "@/lib/utils/tourManager";
import type { TourType } from "@/components/onboarding/TourOverlay";
import { Zap, Keyboard, X, Clock, AlertTriangle, Target, Layers, ListChecks, ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { QueueItem } from "@/types/agent";
import { formatDistanceToNow } from "date-fns";
export default function Today() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [aiTourActive, setAiTourActive] = useState(false);
  const [currentTourType, setCurrentTourType] = useState<TourType>('main');
  const [showAiTourPrompt, setShowAiTourPrompt] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof getRecentInsightsWithDrafts>>>([]);
  const {
    toast
  } = useToast();
  const {
    awardXP,
    progress
  } = useTrainerGamification();
  const {
    updateStats,
    newlyUnlockedAchievements,
    userStats
  } = useAchievementTracker();
  const isMobile = useIsMobile();

  // Real data hooks - Updated with ROI metrics
  const {
    data: dashboardStats,
    isLoading: statsLoading
  } = useTrainerDashboardStats();
  const {
    data: roiMetrics,
    isLoading: roiLoading
  } = useTrainerROIMetrics();
  const {
    data: upcomingSessions,
    isLoading: sessionsLoading
  } = useUpcomingSessions();
  const {
    data: recentUpdates,
    isLoading: updatesLoading
  } = useRecentUpdates();

  // Transform upcoming sessions for the component
  const formattedSessions = (upcomingSessions || []).map(session => ({
    client: session.clientName,
    time: formatDistanceToNow(session.time, {
      addSuffix: true
    }),
    type: session.type
  }));

  // Data fetching & effects
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [queueDataRaw, feedData, insightsData] = await Promise.all([listDraftsAndQueued(), getFeed(), getRecentInsightsWithDrafts()]);

        // Transform Message[] to QueueItem[]
        const queueData: QueueItem[] = await Promise.all(queueDataRaw.map(async msg => {
          // Get contact name
          const {
            data: contact
          } = await supabase.from('contacts').select('first_name, last_name').eq('id', msg.contact_id).single();
          return {
            id: msg.id,
            clientId: msg.contact_id,
            clientName: contact ? `${contact.first_name} ${contact.last_name || ''}`.trim() : 'Unknown',
            preview: msg.content,
            confidence: msg.confidence || 0.5,
            status: msg.status === 'draft' ? 'review' : 'sent',
            why: msg.why_reasons || [],
            createdAt: msg.created_at,
            edit_count: msg.edit_count
          } as QueueItem;
        }));
        setQueue(queueData);
        setFeed(feedData);
        setInsights(insightsData);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  useEffect(() => {
    const checkTourStatus = async () => {
      const shouldShow = await shouldShowAiTour();
      setShowAiTourPrompt(shouldShow);
    };
    checkTourStatus();
  }, []);
  useEffect(() => {
    // Check if the user has just leveled up
    if (progress && progress.level && previousLevel !== null && progress.level > previousLevel) {
      // Award XP for leveling up (adjust amount as needed)
      awardXP(150, "Level Up Bonus!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Stop confetti after 3 seconds
    }
    setPreviousLevel(progress?.level || null);
  }, [progress, awardXP, previousLevel]);

  // Onboarding tour handlers
  const handleStartTour = () => {
    setTourActive(true);
    setCurrentTourType('main');
  };
  const handleStartAiTour = () => {
    setAiTourActive(true);
    setCurrentTourType('ai-agent');
    setShowAiTourPrompt(false);
  };
  const handleCompleteTour = async () => {
    setTourActive(false);
    setAiTourActive(false);
    await markTourComplete('main');
  };
  const handleSkipTour = async () => {
    setTourActive(false);
    setAiTourActive(false);
    await markTourComplete('main');
  };

  // Queue management handlers
  const handleSelectItem = (index: number) => {
    setSelectedIndex(index);
  };
  const handleEditItem = (item: QueueItem) => {
    setEditingItem(item);
  };
  const handleSaveEdit = async (updatedItem: QueueItem) => {
    setQueue(queue.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
    toast({
      title: "Message Updated",
      description: "Your message has been updated successfully."
    });
  };
  const handleApproveItem = async (item: QueueItem) => {
    try {
      await approveMessage(item.id);
      setQueue(queue.filter(i => i.id !== item.id));
      updateStats({
        messagesSentTotal: (userStats.messagesSentTotal || 0) + 1
      });
      toast({
        title: "Message Approved",
        description: "The message has been approved and will be sent."
      });
    } catch (error: any) {
      console.error("Error approving message:", error);
      toast({
        title: "Error",
        description: "Failed to approve message. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleSendNow = async (item: QueueItem) => {
    try {
      await sendNow(item.id);
      setQueue(queue.filter(i => i.id !== item.id));
      updateStats({
        messagesSentTotal: (userStats.messagesSentTotal || 0) + 1
      });
      toast({
        title: "Message Sent",
        description: "The message has been sent immediately."
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([{
    key: 'q',
    ctrl: true,
    callback: () => navigate('/queue'),
    description: 'Open Queue'
  }, {
    key: 'c',
    ctrl: true,
    callback: () => navigate('/clients'),
    description: 'Open Clients'
  }, {
    key: 's',
    ctrl: true,
    callback: () => setSettingsOpen(true),
    description: 'Open Settings'
  }, {
    key: 'm',
    ctrl: true,
    callback: () => setMessagesOpen(true),
    description: 'Open Messages'
  }, {
    key: 'k',
    ctrl: true,
    callback: () => setCalendarOpen(true),
    description: 'Open Calendar'
  }, {
    key: '?',
    callback: () => setShortcutsOpen(true),
    description: 'Show Shortcuts'
  }]);
  const handleViewAllSessions = () => {
    navigate('/calendar');
  };
  const handleViewAllUpdates = () => {
    navigate('/clients');
  };

  // Updated render with new V2 components
  return <>
      {showConfetti && <Confetti active={showConfetti} />}
      <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Home</h1>
            <p className="text-muted-foreground mt-1">
              Your AI-powered coaching command center
            </p>
          </div>
          {queue.length > 0 && <Button onClick={() => navigate('/queue')} variant="outline" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Review Queue ({queue.length})
              <ArrowRight className="h-4 w-4" />
            </Button>}
        </div>

        {/* Quick Action Pills */}
        <QuickActionsPills />

        {/* ROI Metrics Row - Phase 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roiLoading ? <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </> : <>
              <MetricCard title="Hours Saved" value={roiMetrics?.hoursSaved || 0} subtitle="via AI automation" icon={Clock} variant="default" />
              <MetricCard title="Churn Risk" value={roiMetrics?.churnRisk || 0} subtitle="clients at risk" icon={AlertTriangle} variant={roiMetrics && roiMetrics.churnRisk > 5 ? "danger" : "success"} onClick={() => navigate("/clients?filter=at-risk")} />
              <MetricCard title="Avg Compliance" value={`${roiMetrics?.avgCompliance || 0}%`} subtitle="last 7 days" icon={Target} variant={roiMetrics && roiMetrics.avgCompliance >= 70 ? "success" : "warning"} />
              <MetricCard title="Active Programs" value={roiMetrics?.activePrograms || 0} subtitle="training programs" icon={Layers} onClick={() => navigate("/programs")} />
            </>}
        </div>

        {/* Compliance Trend Chart - Phase 1 */}
        <ComplianceTrendChart />

        {/* Secondary Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingSessions onViewAll={handleViewAllSessions} />
          <RecentUpdates onViewAll={handleViewAllUpdates} />
        </div>

        {/* Legacy content preserved for existing functionality */}
        {!isMobile && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            

            {/* Right sidebar widgets preserved */}
            
          </div>}

        {/* Activity Feed preserved */}
        {isLoading ? <ActivityFeedSkeleton /> : <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <ActivityFeed items={feed} />
            </CardContent>
          </Card>}
      </div>

      {/* Modals and overlays preserved */}
      <WelcomeModal open={welcomeOpen} onOpenChange={setWelcomeOpen} onStartTour={() => {
      setWelcomeOpen(false);
      setTimeout(() => handleStartTour(), 300);
    }} />

      <TourOverlay active={tourActive || aiTourActive} tourType={currentTourType} onComplete={handleCompleteTour} onSkip={handleSkipTour} />

      {showAiTourPrompt && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAiTourPrompt(false)}>
          <Card className="max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Meet Your AI Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Want a quick tour of the AI Agent features? Learn how it drafts messages, provides insights, and more.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAiTourPrompt(false)} className="flex-1">
                Skip
              </Button>
              <Button onClick={handleStartAiTour} className="flex-1">
                Start Tour
              </Button>
            </div>
          </Card>
        </div>}

      {editingItem && <MessageEditor open={!!editingItem} onOpenChange={open => !open && setEditingItem(null)} queueItem={editingItem} onSave={(message, tone) => {
      const updated = {
        ...editingItem,
        preview: message
      };
      handleSaveEdit(updated);
    }} />}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CalendarModal open={calendarOpen} onOpenChange={setCalendarOpen} />
      <MessagesModal open={messagesOpen} onOpenChange={setMessagesOpen} />

      <KeyboardShortcutsOverlay open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <TrainerXPNotification />
      {newlyUnlockedAchievements?.map(achievement => <AchievementUnlockNotification key={achievement.id} achievement={achievement as any} show={true} />)}
    </>;
}