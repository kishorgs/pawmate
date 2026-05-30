'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/client';
import type { AppointmentRecord, PetProfile, VeterinarianProfile } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { useAuth } from '@/lib/auth/AuthProvider';

const appointmentSchema = z.object({
  petId: z.string().min(1),
  veterinarianId: z.string().min(1),
  scheduledAt: z.string().min(8),
  durationMinutes: z.number(),
  reason: z.string().min(1),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

export default function AppointmentsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema) as never,
    defaultValues: { status: 'SCHEDULED', durationMinutes: 30 },
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => apiRequest<AppointmentRecord[]>('/appointments'),
  });

  const { data: pets = [] } = useQuery({ queryKey: ['pets'], queryFn: () => apiRequest<PetProfile[]>('/pets') });
  const { data: vets = [] } = useQuery({ queryKey: ['veterinarians'], queryFn: () => apiRequest<VeterinarianProfile[]>('/veterinarians') });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof appointmentSchema>) =>
      apiRequest('/appointments', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpen(false);
      reset();
    },
  });

  const addToCalendar = async (appointment: AppointmentRecord) => {
    const pet = pets.find((p) => p.id === appointment.petId);
    const { url } = await apiRequest<{ url: string }>('/calendar/google-url', {
      method: 'POST',
      body: JSON.stringify({
        title: `Appointment: ${pet?.name ?? 'Pet'}`,
        description: appointment.reason,
        startsAt: appointment.scheduledAt,
        durationMinutes: appointment.durationMinutes,
      }),
    });
    window.open(url, '_blank');
  };

  const columns: GridColDef[] = [
    { field: 'scheduledAt', headerName: 'When', flex: 1.2, valueFormatter: (v) => format(new Date(String(v)), 'PPp') },
    { field: 'reason', headerName: 'Reason', flex: 1.5 },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p) => <StatusChip status={String(p.value)} /> },
    {
      field: 'calendar',
      headerName: 'Calendar',
      flex: 0.8,
      renderCell: (p) => (
        <Button size="small" onClick={() => addToCalendar(p.row as AppointmentRecord)}>
          Add to Google
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Appointments"
        subtitle="Schedule and manage clinic appointments"
        actionLabel={hasRole('ADMIN') ? 'Schedule appointment' : undefined}
        onAction={hasRole('ADMIN') ? () => setOpen(true) : undefined}
      />
      <DataGrid rows={appointments} columns={columns} loading={isLoading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      {hasRole('ADMIN') && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Schedule appointment</DialogTitle>
          <Box component="form" onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Pet" select {...register('petId')}>
                {pets.map((pet) => <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>)}
              </TextField>
              <TextField label="Veterinarian" select {...register('veterinarianId')}>
                {vets.map((vet) => <MenuItem key={vet.id} value={vet.id}>{vet.firstName} {vet.lastName}</MenuItem>)}
              </TextField>
              <TextField label="Scheduled at" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} {...register('scheduledAt')} />
              <TextField label="Duration (minutes)" type="number" {...register('durationMinutes', { valueAsNumber: true })} />
              <TextField label="Reason" {...register('reason')} />
              <TextField label="Status" select {...register('status')}>
                {['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
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
