export function isQuietHours(timezone = 'America/Chicago'): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(now));
  return hour >= 21 || hour < 8;
}

export function getQuietHoursMessage(): string {
  return "Quiet hours (9 PM - 8 AM CT): This will be queued for delivery";
}

