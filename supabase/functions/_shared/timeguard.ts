export interface QuietHoursConfig {
  quiet_hours_start?: string | null; // 'HH:MM:SS'
  quiet_hours_end?: string | null;   // 'HH:MM:SS'
}

export interface FrequencyConfig {
  frequency_cap_daily?: number | null;
  frequency_cap_weekly?: number | null;
}

export function checkQuietHours(
  scheduledAt: Date,
  config: QuietHoursConfig,
): { allowed: boolean; nextAvailable?: Date } {
  const start = config.quiet_hours_start ? toTodayTime(config.quiet_hours_start) : null;
  const end = config.quiet_hours_end ? toTodayTime(config.quiet_hours_end) : null;
  if (!start || !end) return { allowed: true };

  const isOvernight = end <= start;
  const current = toTodayTime(scheduledAt.toTimeString().slice(0, 8));

  let inQuiet = false;
  if (isOvernight) {
    // Quiet from start -> 24:00 and 00:00 -> end
    inQuiet = current >= start || current < end;
  } else {
    inQuiet = current >= start && current < end;
  }

  if (!inQuiet) return { allowed: true };

  const next = new Date(scheduledAt);
  if (isOvernight && current < end) {
    // same day end window
    next.setHours(...parseHMS(config.quiet_hours_end!));
  } else {
    // move to next allowed start (next day if needed)
    const [h, m, s] = parseHMS(config.quiet_hours_start!);
    if (!isOvernight) {
      // today at start
      next.setHours(h, m, s, 0);
      if (current >= start) next.setDate(next.getDate() + 1);
    } else {
      // tomorrow at end (quiet runs overnight until end)
      next.setDate(next.getDate() + 1);
      next.setHours(...parseHMS(config.quiet_hours_end!));
    }
  }

  return { allowed: false, nextAvailable: next };
}

export function checkFrequencyCap(
  counts: { today: number; week: number },
  config: FrequencyConfig,
): { allowed: boolean; limit?: "daily" | "weekly"; remaining?: number } {
  const dailyCap = config.frequency_cap_daily ?? null;
  const weeklyCap = config.frequency_cap_weekly ?? null;

  if (dailyCap != null && counts.today >= dailyCap) {
    return { allowed: false, limit: "daily", remaining: 0 };
  }
  if (weeklyCap != null && counts.week >= weeklyCap) {
    return { allowed: false, limit: "weekly", remaining: 0 };
  }

  const dailyRemaining = dailyCap != null ? Math.max(0, dailyCap - counts.today) : Infinity;
  const weeklyRemaining = weeklyCap != null ? Math.max(0, weeklyCap - counts.week) : Infinity;
  const remaining = Math.min(dailyRemaining, weeklyRemaining);
  return { allowed: true, remaining: Number.isFinite(remaining) ? remaining : undefined };
}

function parseHMS(hms: string): [number, number, number] {
  const [h, m, s] = hms.split(":" ).map((x) => parseInt(x, 10));
  return [h || 0, m || 0, s || 0];
}

function toTodayTime(hms: string): Date {
  const [h, m, s] = parseHMS(hms);
  const d = new Date();
  d.setHours(h, m, s, 0);
  return d;
}
