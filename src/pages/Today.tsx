import { useState, useEffect, memo } from "react";
import { fixtures } from "@/lib/fixtures";
import { QueueCard } from "@/components/agent/QueueCard";
import { ActivityFeed } from "@/components/agent/ActivityFeed";
import { MessageEditor } from "@/components/agent/MessageEditor";
import { ValueMetricsWidget } from "@/components/agent/ValueMetricsWidget";
import { MessagesWidget } from "@/components/agent/MessagesWidget";
import { CalendarWidget } from "@/components/agent/CalendarWidget";
import { AtRiskWidget } from "@/components/agent/AtRiskWidget";
import { ProgramBuilderCard } from "@/components/agent/ProgramBuilderCard";
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
import type { QueueItem } from "@/types/agent";

// Memoized QueueList component for performance
const QueueList = memo(({ queue, selectedIndex, onApprove, onEdit }: any) => (
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
          isSelected={idx === selectedIndex}
        />
      </div>
    ))}
  </>
));
QueueList.displayName = 'QueueList';

export default function Today() {
  const [queue, setQueue] = useState(fixtures.queue);
  const [feed, setFeed] = useState(fixtures.feed);
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
  const { toast } = useToast();
  const { awardXP, progress } = useTrainerGamification();
  const { updateStats, newlyUnlockedAchievements } = useAchievementTracker();
  const isMobile = useIsMobile();

  // Check if first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem("welcomeShown");
    if (!welcomeShown) {
      setWelcomeOpen(true);
    }

    // Track page view
    analytics.track('page_viewed', { page: 'today' });

    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

  const handleApprove = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    // Remove from queue
    setQueue((prev) => prev.filter((q) => q.id !== id));

    // Add to feed with approval timestamp
    const feedItem = {
      id: `feed-${Date.now()}-${id}`,
      ts: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      action: "sent" as const,
      client: item.clientName,
      clientId: id,
      status: "success" as const,
      why: item.why.join(", "),
      messagePreview: item.preview,
      confidence: item.confidence,
    };
    setFeed((prev) => [feedItem, ...prev]);

    // Award XP and update stats
    awardXP(25, "Approved message");
    updateStats({
      messagesSentToday: feed.length + 1,
      messagesSentTotal: feed.length + 1,
      timeSavedHours: ((feed.length + 1) * 5) / 60, // 5 min per message
    });

    // Track analytics
    analytics.track('queue_item_approved', { id });
    analytics.track('xp_earned', { amount: 25, reason: 'Approved message' });

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
  };

  const handleEdit = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    setEditingItem(item);
  };

  const handleSaveEdit = (updatedMessage: string, tone: string) => {
    if (!editingItem) return;
    
    // Update queue item
    setQueue((prev) =>
      prev.map((q) =>
        q.id === editingItem.id
          ? { ...q, preview: updatedMessage }
          : q
      )
    );

    // Award XP and update stats
    awardXP(50, "Edited message");
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
  };

  const handleUndo = (feedItemId: string) => {
    const feedItem = feed.find((f) => f.id === feedItemId);
    if (!feedItem || !feedItem.clientId) return;

    // Move back to queue
    const queueItem: QueueItem = {
      id: feedItem.clientId,
      clientId: feedItem.clientId,
      clientName: feedItem.client,
      preview: feedItem.messagePreview || '',
      confidence: feedItem.confidence || 0.8,
      status: "review",
      why: feedItem.why.split(", "),
      createdAt: new Date().toISOString(),
    };

    setQueue((prev) => [queueItem, ...prev]);
    setFeed((prev) => prev.filter((f) => f.id !== feedItemId));

    // Small penalty
    awardXP(-10, "Undid message");

    // Track analytics
    analytics.track('queue_item_undone', { id: feedItemId });

    toast({
      title: "Message recalled",
      description: "Draft returned to queue. -10 XP",
    });
  };

  const handleApproveAllSafe = () => {
    const safeItems = queue.filter(item => item.confidence >= 0.8);
    
    if (safeItems.length === 0) {
      toast({
        title: "No safe items",
        description: "All items need manual review.",
      });
      return;
    }

    // Batch approve with staggered animation
    safeItems.forEach((item, index) => {
      setTimeout(() => {
        handleApprove(item.id);
      }, index * 200);
    });

    // Bonus XP for batch efficiency
    if (safeItems.length >= 3) {
      setTimeout(() => {
        awardXP(75, "Efficiency bonus");
        analytics.track('xp_earned', { amount: 75, reason: 'Efficiency bonus' });
      }, safeItems.length * 200 + 100);
    }

    toast({
      title: `Approving ${safeItems.length} safe messages`,
      description: `+${safeItems.length * 25 + (safeItems.length >= 3 ? 75 : 0)} XP total`,
    });
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
            <MessagesWidget onOpenMessages={() => setMessagesOpen(true)} />
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
                onUndo={handleUndo} 
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
