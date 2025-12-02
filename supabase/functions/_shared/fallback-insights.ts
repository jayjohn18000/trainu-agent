/**
 * Template-based fallback insights when AI is unavailable
 */

export interface ChurnInsight {
  churnProbability: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  riskCategory: 'critical' | 'high' | 'medium' | 'low' | 'healthy';
  riskFactors: string[];
  positiveIndicators: string[];
  earlyWarningSignals: string[];
  hypothesis: string;
  recommendedActions: Array<{
    action: string;
    priority: number;
    timing: 'immediate' | 'this_week' | 'this_month';
  }>;
  reengagementProbability: number;
  reasoning: string;
}

export function generateFallbackChurnInsight(client: any): ChurnInsight {
  const now = Date.now();
  const daysSinceContact = client.last_message_sent_at
    ? Math.floor((now - new Date(client.last_message_sent_at).getTime()) / 86400000)
    : 999;

  const daysSinceSession = client.last_session_at
    ? Math.floor((now - new Date(client.last_session_at).getTime()) / 86400000)
    : 999;

  // Simple heuristic scoring
  let risk = 10;
  risk += Math.min(40, daysSinceContact * 3);
  risk += Math.min(30, daysSinceSession * 2);
  risk += (client.current_streak || 0) < 2 ? 15 : 0;
  risk += (client.missed_sessions || 0) * 5;
  risk = Math.min(100, Math.max(0, risk));

  const probability = risk / 100;

  return {
    churnProbability: probability,
    confidenceLevel: 'low', // Fallback = low confidence
    riskCategory:
      probability > 0.7
        ? 'high'
        : probability > 0.4
        ? 'medium'
        : probability > 0.2
        ? 'low'
        : 'healthy',
    riskFactors: generateRiskFactors(daysSinceContact, daysSinceSession, client),
    positiveIndicators: generatePositiveIndicators(client),
    earlyWarningSignals: [],
    hypothesis: `Client hasn't been contacted in ${daysSinceContact} days${
      daysSinceSession < 999 ? ` and no session in ${daysSinceSession} days` : ''
    }`,
    recommendedActions: [
      {
        action: 'Send check-in message',
        priority: 1,
        timing: probability > 0.5 ? 'immediate' : 'this_week',
      },
      {
        action: 'Review recent activity and engagement patterns',
        priority: 2,
        timing: 'this_week',
      },
    ],
    reengagementProbability: Math.max(0.3, 1 - probability * 0.5),
    reasoning: 'Generated using fallback heuristics due to AI unavailability.',
  };
}

function generateRiskFactors(
  daysSinceContact: number,
  daysSinceSession: number,
  client: any
): string[] {
  const factors: string[] = [];
  if (daysSinceContact > 7) {
    factors.push(`No contact in ${daysSinceContact} days`);
  }
  if (daysSinceSession > 14) {
    factors.push(`No session in ${daysSinceSession} days`);
  }
  if ((client.current_streak || 0) === 0) {
    factors.push('Broken streak');
  }
  if ((client.missed_sessions || 0) > 2) {
    factors.push(`${client.missed_sessions} missed sessions`);
  }
  if ((client.response_rate || 0) < 0.5) {
    factors.push('Low response rate');
  }
  return factors.length > 0 ? factors : ['No significant risk factors detected'];
}

function generatePositiveIndicators(client: any): string[] {
  const indicators: string[] = [];
  if ((client.current_streak || 0) >= 4) {
    indicators.push(`${client.current_streak} week streak`);
  }
  if ((client.response_rate || 0) > 0.8) {
    indicators.push('High response rate');
  }
  if ((client.sessions_completed || 0) > (client.sessions_scheduled || 0) * 0.9) {
    indicators.push('Excellent attendance rate');
  }
  return indicators;
}

