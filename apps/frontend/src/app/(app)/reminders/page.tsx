'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/client';
import type { EnrichedReminder, PetProfile } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { useAuth } from '@/lib/auth/AuthProvider';

type ReminderForm = {
  petId: string;
  type: 'VACCINATION' | 'MEDICATION';
  title: string;
  notes?: string;
  medicineName?: string;
  dosage?: string;
  instructions?: string;
  startDate: string;
  frequencyValue: number;
  frequencyUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  endCondition: 'NEVER' | 'END_DATE' | 'OCCURRENCE_COUNT';
  endDate?: string;
  occurrenceCount?: number;
};

const reminderSchema = z.object({
  petId: z.string().min(1),
  type: z.enum(['VACCINATION', 'MEDICATION']),
  title: z.string().min(1),
  notes: z.string().optional(),
  medicineName: z.string().optional(),
  dosage: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string().min(8),
  frequencyValue: z.coerce.number().min(1),
  frequencyUnit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']),
  endCondition: z.enum(['NEVER', 'END_DATE', 'OCCURRENCE_COUNT']),
  endDate: z.string().optional(),
  occurrenceCount: z.coerce.number().int().min(1).optional(),
});

export default function RemindersPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema) as never,
    defaultValues: {
      type: 'VACCINATION',
      frequencyValue: 1,
      frequencyUnit: 'YEAR',
      endCondition: 'NEVER',
    },
  });

  const reminderType = watch('type');
  const endCondition = watch('endCondition');

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => apiRequest<EnrichedReminder[]>('/reminders'),
  });

  const { data: pets = [] } = useQuery({ queryKey: ['pets'], queryFn: () => apiRequest<PetProfile[]>('/pets') });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof reminderSchema>) =>
      apiRequest('/reminders', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setOpen(false);
      reset();
    },
  });

  const filtered = useMemo(() => {
    if (tab === 1) return reminders.filter((r) => r.status === 'OVERDUE');
    if (tab === 2) return reminders.filter((r) => r.status === 'UPCOMING' || r.status === 'DUE');
    return reminders;
  }, [reminders, tab]);

  const addToCalendar = async (reminder: EnrichedReminder) => {
    if (!reminder.nextOccurrence) return;
    const { url } = await apiRequest<{ url: string }>('/calendar/google-url', {
      method: 'POST',
      body: JSON.stringify({
        title: reminder.title,
        description: reminder.notes,
        startsAt: reminder.nextOccurrence,
      }),
    });
    window.open(url, '_blank');
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1.2 },
    { field: 'type', headerName: 'Type', flex: 0.8 },
    {
      field: 'nextOccurrence',
      headerName: 'Next',
      flex: 1,
      valueFormatter: (v) => (v ? format(new Date(String(v)), 'PP') : '—'),
    },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p) => <StatusChip status={String(p.value)} /> },
    {
      field: 'calendar',
      headerName: 'Calendar',
      flex: 0.9,
      renderCell: (p) => (
        <Button size="small" onClick={() => addToCalendar(p.row as EnrichedReminder)}>
          Google Calendar
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Reminder Center"
        subtitle="Vaccination and medication reminders"
        actionLabel={hasRole('ADMIN') ? 'Create reminder' : undefined}
        onAction={hasRole('ADMIN') ? () => setOpen(true) : undefined}
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Overdue" />
        <Tab label="Upcoming" />
      </Tabs>
      <DataGrid rows={filtered} columns={columns} loading={isLoading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      {hasRole('ADMIN') && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Create reminder</DialogTitle>
          <Box component="form" onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Pet" select {...register('petId')}>
                {pets.map((pet) => <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>)}
              </TextField>
              <TextField label="Type" select {...register('type')}>
                <MenuItem value="VACCINATION">Vaccination</MenuItem>
                <MenuItem value="MEDICATION">Medication</MenuItem>
              </TextField>
              <TextField label="Title" {...register('title')} />
              {reminderType === 'MEDICATION' && (
                <>
                  <TextField label="Medicine name" {...register('medicineName')} />
                  <TextField label="Dosage" {...register('dosage')} />
                  <TextField label="Instructions" {...register('instructions')} />
                </>
              )}
              <TextField label="Start date" type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('startDate')} />
              <TextField label="Frequency value" type="number" {...register('frequencyValue', { valueAsNumber: true })} />
              <TextField label="Frequency unit" select {...register('frequencyUnit')}>
                {['DAY', 'WEEK', 'MONTH', 'YEAR'].map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
              <TextField label="End condition" select {...register('endCondition')}>
                {['NEVER', 'END_DATE', 'OCCURRENCE_COUNT'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              {endCondition === 'END_DATE' && (
                <TextField label="End date" type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('endDate')} />
              )}
              {endCondition === 'OCCURRENCE_COUNT' && (
                <TextField label="Occurrence count" type="number" {...register('occurrenceCount', { valueAsNumber: true })} />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>Save</Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
