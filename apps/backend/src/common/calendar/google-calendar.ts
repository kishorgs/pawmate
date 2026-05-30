import { addMinutes } from 'date-fns';

export interface CalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  startsAt: Date | string;
  durationMinutes?: number;
}

function toCalendarDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  const start =
    typeof event.startsAt === 'string'
      ? new Date(event.startsAt)
      : event.startsAt;
  const end = addMinutes(start, event.durationMinutes ?? 30);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
  });
  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
