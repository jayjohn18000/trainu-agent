/**
 * Analytics tracking system for user actions and metrics
 */

export type AnalyticsEvent = 
  | 'queue_item_approved'
  | 'queue_item_edited'
  | 'queue_item_undone'
  | 'message_sent'
  | 'client_nudged'
  | 'client_viewed'
  | 'agent_toggled'
  | 'page_viewed'
  | 'shortcut_used'
  | 'level_up'
  | 'xp_earned';

interface AnalyticsEventData {
  event: AnalyticsEvent;
  timestamp: number;
  metadata?: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEventData[] = [];
  private sessionStart: number = Date.now();

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent, metadata?: Record<string, any>) {
    const eventData: AnalyticsEventData = {
      event,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(eventData);

    // Store in localStorage for persistence
    this.saveToStorage();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, metadata);
    }

    // Here you could send to your analytics backend
    // this.sendToBackend(eventData);
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEventData[] {
    return [...this.events];
  }

  /**
   * Get events filtered by type
   */
  getEventsByType(event: AnalyticsEvent): AnalyticsEventData[] {
    return this.events.filter(e => e.event === event);
  }

  /**
   * Get session metrics
   */
  getSessionMetrics() {
    const sessionDuration = Date.now() - this.sessionStart;
    const approvalCount = this.getEventsByType('queue_item_approved').length;
    const editCount = this.getEventsByType('queue_item_edited').length;
    const nudgeCount = this.getEventsByType('client_nudged').length;
    const xpEvents = this.getEventsByType('xp_earned');
    const totalXP = xpEvents.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

    return {
      sessionDuration,
      approvalCount,
      editCount,
      nudgeCount,
      totalXP,
      eventCount: this.events.length,
    };
  }

  /**
   * Clear all events (for testing or reset)
   */
  clear() {
    this.events = [];
    this.sessionStart = Date.now();
    localStorage.removeItem('analytics-events');
  }

  /**
   * Save events to localStorage
   */
  private saveToStorage() {
    try {
      // Keep only last 1000 events to prevent storage bloat
      const eventsToSave = this.events.slice(-1000);
      localStorage.setItem('analytics-events', JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  /**
   * Load events from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('analytics-events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error);
    }
  }

  /**
   * Initialize analytics
   */
  init() {
    this.loadFromStorage();
    this.track('page_viewed', { path: window.location.pathname });
  }
}

// Singleton instance
export const analytics = new Analytics();

// Initialize on load
if (typeof window !== 'undefined') {
  analytics.init();
}
