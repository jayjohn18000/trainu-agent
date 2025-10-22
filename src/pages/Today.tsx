import { useState, useEffect } from "react";
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
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CalendarModal } from "@/components/modals/CalendarModal";
import { MessagesModal } from "@/components/modals/MessagesModal";
import { KeyboardShortcutsOverlay } from "@/components/navigation/KeyboardShortcutsOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTrainerGamification } from "@/hooks/useTrainerGamification";
import { useAchievementTracker } from "@/hooks/useAchievementTracker";
import { TrainerXPNotification } from "@/components/gamification/TrainerXPNotification";
import { AchievementUnlockNotification } from "@/components/ui/AchievementUnlockNotification";
import { Zap, CheckCircle, TrendingUp, Keyboard } from "lucide-react";
import type { QueueItem } from "@/types/agent";

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
  const { toast } = useToast();
  const { awardXP } = useTrainerGamification();
  const { updateStats, newlyUnlockedAchievements } = useAchievementTracker();

  // Check if first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem("welcomeShown");
    if (!welcomeShown) {
      setWelcomeOpen(true);
    }
  }, []);

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

    toast({
      title: "Message approved",
      description: `Draft to ${item.clientName} will be sent. +25 XP`,
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
      key: "a",
      callback: () => {
        if (queue.length > 0 && queue[selectedIndex]) {
          handleApprove(queue[selectedIndex].id);
        }
      },
      description: "Approve current item",
    },
    {
      key: "e",
      callback: () => {
        if (queue.length > 0 && queue[selectedIndex]) {
          handleEdit(queue[selectedIndex].id);
        }
      },
      description: "Edit current item",
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
      
      <div className="container mx-auto px-4 md:px-6 py-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Today</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            {safeItemsCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleApproveAllSafe}
              >
                <Zap className="h-4 w-4 mr-2" />
                Approve {safeItemsCount} Safe
              </Button>
            )}
          </div>
        </div>

        {/* 2-Column Layout: Queue + Your Impact/Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Queue Column */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/queue'}
              className="w-full text-left group"
              data-tour="queue"
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
            
            {queue.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">All Caught Up! 🎉</h3>
                    <p className="text-muted-foreground">
                      Great work! No pending items in your queue.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {queue.slice(0, 3).map((item) => (
                  <QueueCard
                    key={item.id}
                    item={item}
                    onApprove={() => handleApprove(item.id)}
                    onEdit={() => handleEdit(item.id)}
                  />
                ))}
                {queue.length > 3 && (
                  <button
                    onClick={() => window.location.href = '/queue'}
                    className="w-full"
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
          </div>

          {/* Right Column: Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Overview</h2>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                ↑ 15%
              </Badge>
            </div>
            <div data-tour="metrics">
              <ValueMetricsWidget queueCount={queue.length} feedCount={feed.length} />
            </div>
            <MessagesWidget onOpenMessages={() => setMessagesOpen(true)} />
          </div>
        </div>

        {/* Bottom Widgets Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Activity Feed */}
          <div className="border border-border rounded-lg p-6 bg-card/50">
            <ActivityFeed 
              items={feed.slice(0, Math.max(8, queue.length))} 
              onUndo={handleUndo} 
            />
          </div>
          
          {/* Right Column: Calendar + AtRisk */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            <CalendarWidget onOpenCalendar={() => setCalendarOpen(true)} />
            <AtRiskWidget />
          </div>
        </div>
      </div>

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
    </>
  );
}
