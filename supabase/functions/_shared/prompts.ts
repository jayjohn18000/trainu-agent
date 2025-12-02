/**
 * Centralized prompt library for AI insight generation
 * Version tracking enables A/B testing and prompt improvements
 */

export interface ChurnData {
  clientName: string;
  relationshipWeeks: number;
  status: string;
  messageCount: number;
  messagesReceived: number;
  avgResponseTime: string;
  responseTimeTrend: string;
  sessionsScheduled: number;
  sessionsCompleted: number;
  sessionsCancelled: number;
  noShows: number;
  lastSessionDate: string;
  currentStreak: number;
  peakStreak: number;
  streakTrend: string;
  preferredDays: string[];
  timePreference: string;
  programName?: string;
  programCompletion: number;
  exercisesLogged: number;
  recentNotes?: string;
}

export interface QueueData {
  atRiskClients: Array<{
    name: string;
    daysAgo: number;
    streak: number;
    lastMessageAt: string | null;
  }>;
  positiveClients: Array<{
    name: string;
    streak: number;
    daysSinceCreated: number;
  }>;
}

export interface ClientInsightData {
  clientName: string;
  checkins: any[];
  frequency: string;
  goals: any[];
  metrics: any;
  messageContext: string;
  notes: string;
}

export const PROMPTS = {
  CHURN_PREDICTION: {
    version: '1.0',
    template: (data: ChurnData): string => `You are an expert fitness industry analyst specializing in client retention.

CLIENT PROFILE:
Name: ${data.clientName}
Relationship Duration: ${data.relationshipWeeks} weeks
Current Status: ${data.status}

ENGAGEMENT DATA (Last 30 Days):
- Messages Sent: ${data.messageCount}
- Messages Received: ${data.messagesReceived}
- Avg Response Time: ${data.avgResponseTime}
- Response Time Trend: ${data.responseTimeTrend}

ATTENDANCE DATA:
- Sessions Scheduled: ${data.sessionsScheduled}
- Sessions Completed: ${data.sessionsCompleted}
- Sessions Cancelled: ${data.sessionsCancelled}
- No-Shows: ${data.noShows}
- Last Session: ${data.lastSessionDate}

BEHAVIORAL PATTERNS:
- Check-in Streak: ${data.currentStreak} (Peak: ${data.peakStreak})
- Streak Trend: ${data.streakTrend}
- Preferred Days: ${data.preferredDays.join(', ') || 'None'}
- Time Preference: ${data.timePreference}

PROGRAM DATA:
- Current Program: ${data.programName || 'None'}
- Completion Rate: ${data.programCompletion}%
- Exercises Logged: ${data.exercisesLogged}

RECENT NOTES FROM TRAINER:
${data.recentNotes || 'No notes'}

Analyze this client's churn risk. Consider:
1. Engagement trajectory (improving, stable, declining)
2. Behavioral red flags (missed sessions, delayed responses)
3. Positive indicators (streaks, program adherence)
4. External factors (schedule changes, life events hinted in notes)

Output ONLY valid JSON:
{
  "churnProbability": 0.0,
  "confidenceLevel": "high",
  "riskCategory": "low",
  "riskFactors": [],
  "positiveIndicators": [],
  "earlyWarningSignals": [],
  "hypothesis": "",
  "recommendedActions": [{"action": "", "priority": 1, "timing": "immediate"}],
  "reengagementProbability": 0.0,
  "reasoning": ""
}`,
  },

  QUEUE_INSIGHTS: {
    version: '1.0',
    template: (data: QueueData): string => `You are analyzing client engagement patterns for a personal trainer. Perform deep root cause analysis.

AT-RISK CLIENTS:
${data.atRiskClients.map(c => `
- ${c.name}: ${c.daysAgo} days since check-in
  Current Streak: ${c.streak} weeks
  Last Message: ${c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : 'Never'}
`).join('\n')}

POSITIVE MOMENTUM CLIENTS:
${data.positiveClients.map(c => `
- ${c.name}: ${c.streak} week streak
  Days Active: ${c.daysSinceCreated}
`).join('\n')}

Generate exactly 2 insights with deep analysis:

1. AT-RISK INSIGHT (riskLevel: "high"):
   - Root cause hypothesis (not just symptoms)
   - Supporting evidence from data
   - Diagnostic questions to ask trainer
   - Tailored re-engagement strategies
   - Success probability for each strategy

2. POSITIVE MOMENTUM INSIGHT (riskLevel: "low"):
   - What's working well
   - Patterns to replicate
   - Opportunities to celebrate/amplify

Output ONLY valid JSON:
{
  "insights": [
    {
      "title": "",
      "description": "",
      "riskLevel": "high",
      "rootCause": "",
      "evidence": [],
      "diagnosticQuestions": [],
      "strategies": [{"strategy": "", "successProbability": 0.0}],
      "clientNames": []
    },
    {
      "title": "",
      "description": "",
      "riskLevel": "low",
      "rootCause": "",
      "evidence": [],
      "diagnosticQuestions": [],
      "strategies": [],
      "clientNames": []
    }
  ]
}`,
  },

  CLIENT_INSIGHTS: {
    version: '1.0',
    template: (data: ClientInsightData): string => `Generate 3 personalized insights for ${data.clientName}'s fitness journey.

CLIENT PROFILE:
- Check-in History: ${JSON.stringify(data.checkins)}
- Workout Frequency: ${data.frequency}
- Goals: ${JSON.stringify(data.goals)}
- Progress Metrics: ${JSON.stringify(data.metrics)}
- Recent Interactions: ${data.messageContext}
- Trainer Notes: ${data.notes}

Generate exactly 3 insights:
1. PROGRESS INSIGHT: Celebrating wins or identifying gaps
2. PATTERN INSIGHT: Consistency, timing, engagement trends
3. RECOMMENDATION: Next steps, program adjustments

Output ONLY valid JSON:
{
  "insights": [
    {
      "title": "",
      "description": "",
      "actionable": "",
      "impact": "high",
      "category": "progress"
    },
    {
      "title": "",
      "description": "",
      "actionable": "",
      "impact": "medium",
      "category": "pattern"
    },
    {
      "title": "",
      "description": "",
      "actionable": "",
      "impact": "high",
      "category": "recommendation"
    }
  ]
}`,
  },
};

export function getPromptVersion(promptType: keyof typeof PROMPTS): string {
  return PROMPTS[promptType]?.version || '1.0';
}

