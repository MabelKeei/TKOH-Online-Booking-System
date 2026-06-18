export type ParsedHkPublicHoliday = {
  date: string;
  summary: string;
  sourceUid: string;
};

function parseDtStartYmd(raw: unknown): string | null {
  if (Array.isArray(raw)) {
    const first = String(raw[0] ?? '').trim();
    if (/^\d{8}$/.test(first)) {
      return `${first.slice(0, 4)}-${first.slice(4, 6)}-${first.slice(6, 8)}`;
    }
    return null;
  }
  const text = String(raw ?? '').trim();
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  return null;
}

export function parse1823HolidayJson(payload: unknown): ParsedHkPublicHoliday[] {
  const events = (payload as { vcalendar?: Array<{ vevent?: unknown[] }> })
    ?.vcalendar?.[0]?.vevent;
  if (!Array.isArray(events)) return [];

  const byDate = new Map<string, ParsedHkPublicHoliday>();

  for (const event of events) {
    const item = event as {
      dtstart?: unknown;
      summary?: unknown;
      uid?: unknown;
    };
    const date = parseDtStartYmd(item.dtstart);
    if (!date) continue;
    byDate.set(date, {
      date,
      summary: String(item.summary ?? 'Public Holiday').trim() || 'Public Holiday',
      sourceUid: String(item.uid ?? '').trim(),
    });
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
