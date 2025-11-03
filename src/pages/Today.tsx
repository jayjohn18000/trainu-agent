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
import { ValueMetricsWidget } from "@/components/agent/ValueMetricsWidget";
import { MessagesWidget } from "@/components/agent/MessagesWidget";
import { CalendarWidget } from "@/components/agent/CalendarWidget";
import { AtRiskWidget } from "@/components/agent/AtRiskWidget";
import { ProgramBuilderCard } from "@/components/agent/ProgramBuilderCard";
import { DraftCard } from "@/components/agent/DraftCard";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { Confetti } from "@/components/effects/Confetti";
import { QueueCardSkeletonList } from "@/components/skeletons/QueueCardSkeleton";
import { ActivityFeedSkeleton } from "@/components/skeletons/ActivityFeedSkeleton";
import { ValueMetricsSkeleton } from "@/components/skeletons/ValueMetricsSkeleton";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { MessagesModal } from "@/components/modals/MessagesModal";
import { KeyboardShortcutsOverlay } from "@/components/navigation/KeyboardShortcutsOverlay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { useAchievementTracker } from "@/hooks/useAchievementTracker";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrainerXPNotification } from "@/components/gamification/TrainerXPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";
import { Zap, CheckCircle, TrendingUp, Keyboard } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { resolveGhlLink } from "@/lib/ghl/links";
import { getFlags } from "@/lib/flags";
import { cn } from "@/lib/utils";
import type { QueueItem } from "@/types/agent";

// Memoized QueueList component for performance
const QueueList = memo(({ queue, selectedIndex, onApprove, onEdit, onSendNow }: any) => (
  <>
    {queue.slice(0, 3).map((item: any, idx: number) => (
      <div 
        key={item.id}
        className="animate-slide-in-from-left"
        style={{ animationDelay: `${idx * 50}ms` }}
      >
        <QueueCard
          item={item}
          onApprove={() => onApprove(item.id)}
          onEdit={() => onEdit(item.id)}
          onSendNow={() => onSendNow(item.id)}
          isSelected={idx === selectedIndex}
        />
      </div>
    ))}
  </>
));
QueueList.displayName = 'QueueList';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof getRecentInsightsWithDrafts>>>([]);
  const { toast } = useToast();
  const { awardXP, progress } = useTrainerGamification();
  const { updateStats, newlyUnlockedAchievements } = useAchievementTracker();
  const isMobile = useIsMobile();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Check if first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem("welcomeShown");
    if (!welcomeShown) {
      setWelcomeOpen(true);
    }

    // Track page view
    analytics.track('page_viewed', { page: 'today' });
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    const queueChannel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadQueue();
        }
      )
      .subscribe();

    const feedChannel = supabase
      .channel('feed-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(feedChannel);
    };
  }, []);

  const loadInsights = async () => {
    try {
      const data = await getRecentInsightsWithDrafts(5);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadQueue(), loadFeed(), loadInsights()]);
    setIsLoading(false);
  };

  const loadQueue = async () => {
    try {
      // Fetch messages from messages table, then hydrate client names
      const msgs = await listDraftsAndQueued(20);
      const contactIds = Array.from(new Set(msgs.map((m) => m.contact_id)));
      let idToName: Record<string, string> = {};
      if (contactIds.length > 0) {
        const { data: contacts, error } = await supabase
          .from("contacts")
          .select("id, first_name, last_name")
          .in("id", contactIds);
        if (error) throw error;
        idToName = (contacts || []).reduce((acc: any, c: any) => {
          acc[c.id] = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Client";
          return acc;
        }, {} as Record<string, string>);
      }

      const mapped = msgs.map((m) => ({
        id: m.id,
        clientId: m.contact_id,
        clientName: idToName[m.contact_id] || "Client",
        preview: m.content,
        confidence: typeof m.confidence === "number" ? m.confidence : 0.75,
        why: m.why_reasons || ["AI suggestion"],
        status: "review",
        createdAt: m.created_at,
        scheduledFor: m.scheduled_for,
      })) as unknown as QueueItem[];

      setQueue(mapped);
    } catch (error) {
      console.error('Failed to load queue:', error);
      toast({
        title: "Error",
        description: "Failed to load queue. Please refresh.",
        variant: "destructive",
      });
    }
  };

  const loadFeed = async () => {
    try {
      const data = await getFeed();
      setFeed(data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    }
  };

  // Track level changes for confetti
  useEffect(() => {
    if (previousLevel === null) {
      setPreviousLevel(progress.level);
    } else if (progress.level > previousLevel) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setPreviousLevel(progress.level);
      analytics.track('level_up', { level: progress.level });
    }
  }, [progress.level, previousLevel]);

  const handleStartTour = () => {
    setTourActive(true);
  };

  const handleCompleteTour = () => {
    setTourActive(false);
  };

  const handleSkipTour = () => {
    setTourActive(false);
  };

  const handleApprove = async (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    try {
      // Approve message via queue-management (messages table)
      const result = await approveMessage(id);

      // Award XP and update stats
      await awardXP(25, "Approved message");
      updateStats({
        messagesSentToday: feed.length + 1,
        messagesSentTotal: feed.length + 1,
        timeSavedHours: ((feed.length + 1) * 5) / 60,
      });

      // Track analytics
      analytics.track('queue_item_approved', { id });
      analytics.track('xp_earned', { amount: 25, reason: 'Approved message' });

      if (result?.deferred_by_quiet_hours && result?.scheduled_for) {
        toast({
          title: "Queued for quiet hours",
          description: `Will send at ${new Date(result.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        });
      } else {
        toast({
          title: "Message Approved",
          description: (
            <div className="flex items-center gap-2">
              <span>Draft to {item.clientName} sent successfully!</span>
              <span className="text-primary font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3" aria-hidden="true" />
                +25 XP
              </span>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      const message = (error as any)?.message || '';
      if (typeof message === 'string' && message.includes('429')) {
        toast({ title: "Frequency cap reached", description: "Try again tomorrow.", variant: "destructive" });
      } else {
        toast({
          title: "Error",
          description: "Failed to approve message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };


  const handleEdit = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    setEditingItem(item);
  };

  const handleSendNow = async (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    try {
      const result = await sendNow(id);
      if (result?.deferred && result?.scheduled_for) {
        toast({
          title: "Quiet hours",
          description: `Deferred to ${new Date(result.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        });
      } else {
        toast({ title: "Message sent", description: `Sent to ${item.clientName}` });
      }
    } catch (error) {
      console.error('Failed to send now:', error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  const handleSaveEdit = async (updatedMessage: string, tone: string) => {
    if (!editingItem) return;
    
    try {
      // Update message content directly
      await supabase
        .from("messages")
        .update({ content: updatedMessage })
        .eq("id", editingItem.id);

      // Award XP and update stats
      await awardXP(50, "Edited message");
      updateStats({
        messagesEdited: (feed.filter(f => f.action === 'sent').length || 0) + 1,
      });

      // Track analytics
      analytics.track('queue_item_edited', { id: editingItem.id });
      analytics.track('xp_earned', { amount: 50, reason: 'Edited message' });

      toast({
        title: "Message updated",
        description: `Draft updated with ${tone} tone. +50 XP`,
      });

      setEditingItem(null);
    } catch (error) {
      console.error('Failed to edit:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleApproveAllSafe = async () => {
    const safeItems = queue.filter(item => item.confidence >= 0.8);
    
    if (safeItems.length === 0) {
      toast({
        title: "No safe items",
        description: "All items need manual review.",
      });
      return;
    }

    try {
      // Approve all safe items individually
      await Promise.all(safeItems.map(item => approveMessage(item.id)));

      // Award XP for batch efficiency
      const totalXP = safeItems.length * 25 + (safeItems.length >= 3 ? 75 : 0);
      await awardXP(totalXP, `Batch approved ${safeItems.length} messages`);
      analytics.track('xp_earned', { amount: totalXP, reason: 'Batch approval' });

      toast({
        title: `Approved ${safeItems.length} messages`,
        description: `+${totalXP} XP total`,
      });
    } catch (error) {
      console.error('Failed to batch approve:', error);
      toast({
        title: "Error",
        description: "Failed to approve messages. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "j",
      callback: () => {
        if (queue.length > 0) {
          setSelectedIndex(prev => Math.min(prev + 1, queue.length - 1));
          analytics.track('shortcut_used', { key: 'j', action: 'next_queue_item' });
        }
      },
      description: "Next item in queue",
    },
    {
      key: "k",
      callback: () => {
        if (queue.length > 0) {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          analytics.track('shortcut_used', { key: 'k', action: 'previous_queue_item' });
        }
      },
      description: "Previous item in queue",
    },
    {
      key: "a",
      callback: () => {
        if (queue.length > 0 && queue[selectedIndex]) {
          handleApprove(queue[selectedIndex].id);
        }
      },
      description: "Approve selected item",
    },
    {
      key: "e",
      callback: () => {
        if (queue.length > 0 && queue[selectedIndex]) {
          handleEdit(queue[selectedIndex].id);
        }
      },
      description: "Edit selected item",
    },
    {
      key: "A",
      shift: true,
      callback: handleApproveAllSafe,
      description: "Approve all safe items",
    },
    {
      key: "3",
      callback: () => setMessagesOpen(true),
      description: "Open messages",
    },
    {
      key: "4",
      callback: () => setCalendarOpen(true),
      description: "Open calendar",
    },
    {
      key: "5",
      callback: () => setSettingsOpen(true),
      description: "Open settings",
    },
    {
      key: "?",
      shift: true,
      callback: () => setShortcutsOpen(true),
      description: "Show keyboard shortcuts",
    },
  ]);

  const safeItemsCount = queue.filter(item => item.confidence >= 0.8).length;

  return (
    <>
      <TrainerXPNotification />
      
      {/* Achievement Notifications */}
      {newlyUnlockedAchievements.map((achievement) => (
        <AchievementUnlockNotification
          key={achievement.id}
          achievement={{
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            tier: achievement.tier,
            icon: achievement.icon,
          }}
          show={true}
        />
      ))}
      
      <main 
        className="container mx-auto px-4 md:px-6 py-4 md:py-6 max-w-[1600px]"
        role="main"
        aria-label="Dashboard"
      >
        {/* Header */}
        <header className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Today</h1>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShortcutsOpen(true)}
                title="Keyboard shortcuts (?)"
                aria-label="View keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            )}
            {safeItemsCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleApproveAllSafe}
                aria-label={`Approve ${safeItemsCount} safe messages`}
              >
                <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
                Approve {safeItemsCount} Safe
              </Button>
            )}
          </div>
        </header>

        {/* WIP Banner */}
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            🚧 Demo Mode: This is a preview of the trainer-first experience
          </p>
        </div>

        {/* Recent Insights */}
        {insights.length > 0 && (
          <section className="mb-6 space-y-3" aria-label="Recent insights">
            <h2 className="text-lg font-semibold">Recent Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onViewDraft={(draftId) => navigate(`/queue#${draftId}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Queue CTA */}
        {queue.length > 0 && (
          <Card className="mb-6 p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Pending Approvals</h3>
                <p className="text-sm text-muted-foreground">
                  {queue.length} message{queue.length > 1 ? 's' : ''} waiting for review
                </p>
              </div>
              <Button onClick={() => navigate('/queue')}>
                Review in Queue →
              </Button>
            </div>
          </Card>
        )}

        {/* 2-Column Layout: Queue + Your Impact/Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
          {/* Queue Column */}
          <section className="space-y-4" aria-label="Message queue">
            <button
              onClick={() => window.location.href = '/queue'}
              className="w-full text-left group"
              data-tour="queue"
              aria-label="View full message queue"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  Queue {queue.length > 0 && `(${queue.length})`}
                </h2>
                <Badge variant="outline" className="text-xs group-hover:border-primary transition-colors">
                  View All →
                </Badge>
              </div>
            </button>
            
            {isLoading ? (
              <QueueCardSkeletonList count={3} />
            ) : queue.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="All Caught Up!"
                description="Great work! No pending items in your queue. Your agent will notify you when there's something new."
              />
            ) : (
              <>
                <QueueList 
                  queue={queue}
                  selectedIndex={selectedIndex}
                  onApprove={handleApprove}
                  onEdit={handleEdit}
                  onSendNow={handleSendNow}
                />
                {queue.length > 3 && (
                  <button
                    onClick={() => window.location.href = '/queue'}
                    className="w-full"
                    aria-label={`View ${queue.length - 3} more items in queue`}
                  >
                    <Card className="p-4 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer text-center">
                      <p className="text-sm text-muted-foreground">
                        +{queue.length - 3} more in queue
                      </p>
                    </Card>
                  </button>
                )}
                <ProgramBuilderCard />
              </>
            )}
          </section>

          {/* Right Column: Overview */}
          <section className="space-y-4" aria-label="Performance overview">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Overview</h2>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                ↑ 15%
              </Badge>
            </div>
            <div data-tour="metrics">
              {isLoading ? (
                <ValueMetricsSkeleton />
              ) : (
                <ValueMetricsWidget queueCount={queue.length} feedCount={feed.length} />
              )}
            </div>
            <div className="flex items-center justify-between">
              <MessagesWidget onOpenMessages={() => setMessagesOpen(true)} />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { url, disabled, reason } = await resolveGhlLink({ type: 'calendar' });
                  if (disabled || !url) {
                    toast({ title: 'GHL calendar unavailable', description: reason || 'Missing configuration', variant: 'destructive' });
                    return;
                  }
                  window.open(url, '_blank');
                }}
                aria-label="Open GHL Calendar"
              >
                Open GHL Calendar
              </Button>
            </div>
          </section>
        </div>

        {/* Bottom Widgets Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Activity Feed */}
          <section className="border border-border rounded-lg p-4 md:p-6 bg-card/50" data-tour="feed" aria-label="Activity feed">
            {isLoading ? (
              <ActivityFeedSkeleton />
            ) : (
              <ActivityFeed 
                items={feed.slice(0, Math.max(8, queue.length))}
              />
            )}
          </section>
          
          {/* Right Column: Calendar + AtRisk */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            <CalendarWidget onOpenCalendar={() => setCalendarOpen(true)} />
            <AtRiskWidget />
          </div>
        </div>
      </main>

      {/* Message Editor */}
      {editingItem && (
        <MessageEditor
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          queueItem={editingItem}
          onSave={handleSaveEdit}
        />
      )}

      {/* Modals */}
      <WelcomeModal 
        open={welcomeOpen} 
        onOpenChange={setWelcomeOpen}
        onStartTour={handleStartTour}
      />
      <TourOverlay 
        active={tourActive}
        onComplete={handleCompleteTour}
        onSkip={handleSkipTour}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CalendarModal open={calendarOpen} onOpenChange={setCalendarOpen} />
      <MessagesModal open={messagesOpen} onOpenChange={setMessagesOpen} />
      <KeyboardShortcutsOverlay open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Confetti on level up */}
      <Confetti active={showConfetti} />
    </>
  );
}
