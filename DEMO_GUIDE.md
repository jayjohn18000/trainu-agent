# TrainU AI Agent Demo Guide

## Overview
TrainU's AI Agent automatically drafts personalized follow-up messages for your clients based on their activity, session history, and engagement patterns. This guide walks through the complete workflow.

## Features

### 1. Queue Management (`/queue`)
The queue displays AI-drafted messages awaiting your review and approval.

**Key Features:**
- **Confidence Scoring**: Each message has a confidence score (0-100%)
  - 🟢 Green (85%+): High confidence, safe to approve
  - 🟡 Yellow (70-84%): Medium confidence, review recommended
  - 🔴 Red (<70%): Low confidence, editing recommended

- **Message Preview**: See exactly what will be sent to your client
- **Why Suggested**: Expandable section explaining the AI's reasoning
- **Scheduled Time**: When the message will be sent

**Actions:**
- **✓ Approve**: Send the message as-is (25 XP)
- **✏️ Edit**: Modify the message before sending (50 XP)
- **↺ Undo**: Reverse approval within 60 minutes (-10 XP)
- **Approve All Safe**: Batch approve all messages with 85%+ confidence (75 XP bonus)

### 2. Activity Feed (`/today`)
Track all your agent interactions in real-time.

**Information Displayed:**
- Action type (sent, edited, regenerated)
- Client name
- Message preview
- Confidence score
- Timestamp
- Reasoning ("Why" this message)

### 3. Gamification System
Stay motivated with XP rewards and leveling:

**XP Rewards:**
- Approve message: 25 XP
- Edit message: 50 XP
- Regenerate message: 25 XP
- Batch approve (3+): 75 XP bonus
- Client responds: 150 XP
- Client books session: 200 XP
- Engage at-risk client (responds within 24h): 100 XP
- 7-day approval streak: 300 XP

**Levels:**
- Level 1-5: Rookie Agent (0-800 XP)
- Level 6-10: Agent Apprentice (1200-3400 XP)
- Level 11-15: Agent Master (4200-8400 XP)
- Level 16-20: Agent Legend (9700-16000 XP)

### 4. Agent Status Bar
Monitor your AI agent's performance:
- Messages sent today
- Response rate
- At-risk clients count
- Average response time
- Current streak

**Agent Controls:**
- Pause/Resume agent activity
- Configure automation settings

## Workflow Example

### Scenario: Lisa's Form Improvement
1. **Queue Review**: 
   - Message appears: "Hey Lisa! Your form has improved so much! 💯 Ready to add weights to your routine?"
   - Confidence: 92% (High)
   - Reason: "Client completed 3 workouts with excellent form notes"

2. **Approval Options**:
   - **Approve**: Message sends immediately → +25 XP
   - **Edit**: Adjust tone or add personalization → +50 XP
   - **Undo**: Changed your mind? Reverse within 60 min

3. **Activity Tracking**:
   - Message logged in activity feed
   - Stats updated (messages sent today +1)
   - XP notification appears

4. **Client Response**:
   - Lisa responds within 24h → +150 XP
   - Lisa books a session → +200 XP

## Best Practices

### Message Approval Strategy
1. **Quick Wins**: Use "Approve All Safe" for 85%+ confidence messages
2. **Personal Touch**: Edit messages for VIP clients or sensitive situations
3. **Learning Loop**: Review "Why Suggested" to understand AI reasoning
4. **Timing**: Schedule messages for optimal engagement times

### Maintaining Streaks
- Approve at least one message daily for streak bonuses
- 7-day streak = 300 XP bonus
- Track streak in Agent Status Bar

### Client Segmentation
- **High Engagement**: Quick approvals work well
- **At-Risk Clients**: Review and personalize messages carefully
- **New Clients**: Add extra warmth and encouragement

## Troubleshooting

### Message Not Sending
- Check agent status (not paused)
- Verify scheduled time hasn't passed
- Confirm client has valid contact info

### Low Confidence Scores
- AI needs more client data (sessions, notes, interactions)
- Consider editing message or regenerating
- Add client notes to improve future suggestions

### XP Not Updating
- Refresh page to sync latest data
- Check activity feed for confirmation
- Realtime updates may take 1-2 seconds

## Next Steps: GHL Integration

To enable real message sending via GoHighLevel:

1. **Connect GHL Account**:
   - Navigate to Settings → Integrations
   - Add GHL API credentials
   - Select default sub-account

2. **Configure Templates**:
   - Map AI message types to GHL campaigns
   - Set up SMS/email preferences
   - Configure reply handling

3. **Test & Deploy**:
   - Send test messages to yourself
   - Verify delivery and tracking
   - Enable for production use

## Support & Feedback

For questions or feature requests:
- In-app: Settings → Help & Support
- Email: support@trainu.app
- Docs: docs.trainu.app

---

**Version**: 1.0  
**Last Updated**: 2025-10-28  
**Status**: Demo Mode (No GHL connection)
