'use client';

import { Chip } from '@mui/material';

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  UPCOMING: 'info',
  DUE: 'warning',
  OVERDUE: 'error',
  COMPLETED: 'success',
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  CANCELLED: 'default',
};

export function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="small"
      label={status}
      color={STATUS_COLORS[status] ?? 'default'}
      variant="outlined"
    />
  );
}
