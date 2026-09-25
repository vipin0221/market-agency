const DATE_KEYS = new Set([
  "scheduledAt",
  "scheduledFor",
  "publishAt",
  "publishDate",
  "plannedFor",
  "scheduleDate",
  "date",
]);

export type ScheduleMark = {
  at: Date;
  raw: string;
  hasTime: boolean;
};

export function readSchedule(body: Record<string, unknown>): ScheduleMark | null {
  for (const [key, value] of Object.entries(body)) {
    const interesting = DATE_KEYS.has(key) || /schedule|publish|planned/i.test(key);
    if (!interesting || typeof value !== "string") continue;
    const raw = value.trim();
    if (!/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/.test(raw)) continue;
    const time = Date.parse(raw);
    if (Number.isNaN(time)) continue;
    return {
      at: new Date(time),
      raw,
      hasTime: /T\d{2}:\d{2}|\d{1,2}:\d{2}/.test(raw),
    };
  }
  return null;
}
