'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/client';
import type { VeterinarianProfile } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/lib/auth/AuthProvider';

const vetSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
});

export default function VeterinariansPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<z.infer<typeof vetSchema>>({
    resolver: zodResolver(vetSchema),
  });

  const { data: vets = [], isLoading } = useQuery({
    queryKey: ['veterinarians'],
    queryFn: () => apiRequest<VeterinarianProfile[]>('/veterinarians'),
  });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof vetSchema>) =>
      apiRequest('/veterinarians', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veterinarians'] });
      setOpen(false);
      reset();
    },
  });

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First name', flex: 1 },
    { field: 'lastName', headerName: 'Last name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.2 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'specialties',
      headerName: 'Specialties',
      flex: 1.2,
      valueGetter: (_v, row) => (row.specialties as string[])?.join(', ') ?? '',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Veterinarians"
        subtitle="Staff directory and availability"
        actionLabel={hasRole('ADMIN') ? 'Add veterinarian' : undefined}
        onAction={hasRole('ADMIN') ? () => setOpen(true) : undefined}
      />
      <DataGrid rows={vets} columns={columns} loading={isLoading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      {hasRole('ADMIN') && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add veterinarian</DialogTitle>
          <Box component="form" onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="First name" {...register('firstName')} />
              <TextField label="Last name" {...register('lastName')} />
              <TextField label="Email" {...register('email')} />
              <TextField label="Phone" {...register('phone')} />
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
