'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/client';
import type { PetProfile, VeterinarianProfile, VisitRecord } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/lib/auth/AuthProvider';

const visitSchema = z.object({
  petId: z.string().min(1),
  veterinarianId: z.string().min(1),
  visitDate: z.string().min(8),
  description: z.string().min(1),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  prescriptionNotes: z.string().optional(),
});

export default function VisitsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<z.infer<typeof visitSchema>>({
    resolver: zodResolver(visitSchema),
  });

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: () => apiRequest<VisitRecord[]>('/visits'),
  });

  const { data: pets = [] } = useQuery({ queryKey: ['pets'], queryFn: () => apiRequest<PetProfile[]>('/pets') });
  const { data: vets = [] } = useQuery({ queryKey: ['veterinarians'], queryFn: () => apiRequest<VeterinarianProfile[]>('/veterinarians') });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof visitSchema>) =>
      apiRequest('/visits', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setOpen(false);
      reset();
    },
  });

  const columns: GridColDef[] = [
    { field: 'visitDate', headerName: 'Date', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    { field: 'diagnosis', headerName: 'Diagnosis', flex: 1.2 },
    { field: 'prescriptionNotes', headerName: 'Prescription', flex: 1.2 },
  ];

  return (
    <Box>
      <PageHeader
        title="Visits"
        subtitle="Clinical visit records and notes"
        actionLabel={hasRole('ADMIN') ? 'Record visit' : undefined}
        onAction={hasRole('ADMIN') ? () => setOpen(true) : undefined}
      />
      <DataGrid rows={visits} columns={columns} loading={isLoading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      {hasRole('ADMIN') && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Record visit</DialogTitle>
          <Box component="form" onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Pet" select {...register('petId')}>
                {pets.map((pet) => <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>)}
              </TextField>
              <TextField label="Veterinarian" select {...register('veterinarianId')}>
                {vets.map((vet) => <MenuItem key={vet.id} value={vet.id}>{vet.firstName} {vet.lastName}</MenuItem>)}
              </TextField>
              <TextField label="Visit date" type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('visitDate')} />
              <TextField label="Description" multiline rows={2} {...register('description')} />
              <TextField label="Diagnosis" multiline rows={2} {...register('diagnosis')} />
              <TextField label="Notes" multiline rows={2} {...register('notes')} />
              <TextField label="Prescription notes" multiline rows={2} {...register('prescriptionNotes')} />
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
