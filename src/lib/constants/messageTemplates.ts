// Hardcoded message templates for demo
export const MESSAGE_TEMPLATES = {
  groupCheckIn: {
    id: "group-check-in",
    name: "Group Check-In",
    content: "Quick check-in for this week. 1–10: how are sessions feeling? Any blockers? {{reschedule_url}}",
    channel: "sms" as const,
    description: "Weekly wellness check for active clients",
  },
  postSession: {
    id: "post-session",
    name: "Post-Session Follow-Up",
    content: "Nice work on {{focus}}. Aim for {{micro_goal}} before next session.",
    channel: "sms" as const,
    description: "Sent after completed sessions to reinforce progress",
  },
  scheduleChange: {
    id: "schedule-change",
    name: "Schedule Change Notification",
    content: "{{first_name}} — {{time}} moves to {{new_time}}. Confirm: {{confirm_url}} or reschedule: {{reschedule_url}}",
    channel: "sms" as const,
    description: "Notify clients of session time changes",
  },
  birthday: {
    id: "birthday",
    name: "Birthday Message",
    content: "Happy birthday {{first_name}}! 🎉 Keep crushing those goals!",
    channel: "sms" as const,
    description: "Automated birthday greeting",
  },
  missedSession: {
    id: "missed-session",
    name: "Missed Session Check-In",
    content: "Hey {{first_name}}, noticed you missed {{day}}'s session. Everything okay? Let's get you back on track: {{reschedule_url}}",
    channel: "sms" as const,
    description: "Gentle re-engagement after missed appointments",
  },
  welcomeNew: {
    id: "welcome-new",
    name: "New Client Welcome",
    content: "Welcome to {{studio_name}}! Excited to start your fitness journey. First session: {{first_session_time}}. Questions? Just reply!",
    channel: "sms" as const,
    description: "Onboarding message for new clients",
  },
} as const;

export type TemplateId = keyof typeof MESSAGE_TEMPLATES;

export function getTemplate(id: TemplateId) {
  return MESSAGE_TEMPLATES[id];
}

export function renderTemplate(templateId: TemplateId, variables: Record<string, string>): string {
  const template = MESSAGE_TEMPLATES[templateId];
  let content: string = template.content;

  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
  });

  return content;
}
