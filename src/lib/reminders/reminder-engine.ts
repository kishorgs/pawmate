/**
 * Generic Reminder Engine — pure functions, isomorphic.
 *
 * Supports DAY / WEEK / MONTH / YEAR frequencies and three end conditions:
 *   - NEVER
 *   - END_DATE (stop after a given date)
 *   - OCCURRENCE_COUNT (stop after N events)
 *
 * Used by Vaccination & Medication reminders today; new reminder types
 * (e.g. grooming, follow-ups) can reuse this engine unchanged.
 */
import { addDays, addMonths, addWeeks, addYears, isAfter, isBefore, isEqual } from "date-fns";

export type FrequencyUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
export type EndConditionType = "NEVER" | "END_DATE" | "OCCURRENCE_COUNT";
export type ReminderType = "VACCINATION" | "MEDICATION";
export type ReminderStatus = "UPCOMING" | "DUE" | "OVERDUE" | "COMPLETED";

export interface ReminderSchedule {
  startDate: string; // ISO date
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  endCondition: EndConditionType;
  endDate?: string;
  occurrenceCount?: number;
}

export function addInterval(date: Date, value: number, unit: FrequencyUnit): Date {
  switch (unit) {
    case "DAY": return addDays(date, value);
    case "WEEK": return addWeeks(date, value);
    case "MONTH": return addMonths(date, value);
    case "YEAR": return addYears(date, value);
  }
}

/**
 * Calculate the next occurrence date strictly after `from`, based on the schedule.
 * Returns null when the schedule has terminated.
 */
export function calculateNextOccurrence(
  schedule: ReminderSchedule,
  from: Date = new Date(),
): Date | null {
  const occurrences = generateOccurrences(schedule, { upTo: addYears(from, 5) });
  return occurrences.find((d) => isAfter(d, from)) ?? null;
}

export interface GenerateOptions {
  /** Hard cap on returned dates to keep memory bounded (default 365). */
  maxOccurrences?: number;
  /** Stop generating beyond this date (default 5y from start). */
  upTo?: Date;
}

/**
 * Generate the full list of occurrence dates for a schedule.
 * For unbounded NEVER schedules, capped by `maxOccurrences`/`upTo`.
 */
export function generateOccurrences(
  schedule: ReminderSchedule,
  options: GenerateOptions = {},
): Date[] {
  const { frequencyValue, frequencyUnit, startDate, endCondition } = schedule;
  if (frequencyValue <= 0) {
    throw new Error("frequencyValue must be > 0");
  }
  const start = new Date(startDate);
  const upTo = options.upTo ?? addYears(start, 5);
  const maxOccurrences = options.maxOccurrences ?? 365;

  const out: Date[] = [];
  let current = start;
  let count = 0;

  while (out.length < maxOccurrences) {
    if (endCondition === "END_DATE" && schedule.endDate) {
      const end = new Date(schedule.endDate);
      if (isAfter(current, end)) break;
    }
    if (endCondition === "OCCURRENCE_COUNT" && schedule.occurrenceCount != null) {
      if (count >= schedule.occurrenceCount) break;
    }
    if (isAfter(current, upTo)) break;

    out.push(current);
    count += 1;
    current = addInterval(current, frequencyValue, frequencyUnit);
  }
  return out;
}

export function deriveReminderStatus(
  nextOccurrence: Date | null,
  now: Date = new Date(),
  dueWindowDays = 3,
): ReminderStatus {
  if (!nextOccurrence) return "COMPLETED";
  const dueStart = addDays(now, -0);
  const dueEnd = addDays(now, dueWindowDays);
  if (isBefore(nextOccurrence, dueStart) && !isEqual(nextOccurrence, dueStart)) {
    return "OVERDUE";
  }
  if (!isAfter(nextOccurrence, dueEnd)) return "DUE";
  return "UPCOMING";
}
