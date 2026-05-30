import {
  calculateNextOccurrence,
  deriveReminderStatus,
  generateOccurrences,
} from './reminder-engine';

describe('ReminderEngine', () => {
  const weeklySchedule = {
    startDate: '2025-01-01',
    frequencyValue: 1,
    frequencyUnit: 'WEEK' as const,
    endCondition: 'OCCURRENCE_COUNT' as const,
    occurrenceCount: 4,
  };

  it('generates expected occurrence count', () => {
    const dates = generateOccurrences(weeklySchedule);
    expect(dates).toHaveLength(4);
  });

  it('calculates next occurrence after a reference date', () => {
    const next = calculateNextOccurrence(weeklySchedule, new Date('2025-01-08'));
    expect(next?.toISOString().slice(0, 10)).toBe('2025-01-15');
  });

  it('derives overdue status for past dates', () => {
    const status = deriveReminderStatus(new Date('2020-01-01'), new Date('2025-01-01'));
    expect(status).toBe('OVERDUE');
  });
});
