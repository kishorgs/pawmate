'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { apiRequest } from '@/lib/api/client';
import type { OwnerProfile, PetProfile } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/lib/auth/AuthProvider';

const petSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string().min(8),
  petType: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER']),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  weightKg: z.number().optional(),
  photoUrl: z.string().optional(),
  ownerId: z.string().min(1),
});

export default function PetsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<z.infer<typeof petSchema>>({
    resolver: zodResolver(petSchema),
    defaultValues: { petType: 'DOG', gender: 'UNKNOWN' },
  });

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => apiRequest<PetProfile[]>('/pets'),
  });

  const { data: owners = [] } = useQuery({
    queryKey: ['owners'],
    queryFn: () => apiRequest<OwnerProfile[]>('/owners'),
    enabled: hasRole('ADMIN'),
  });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof petSchema>) =>
      apiRequest<PetProfile>('/pets', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setOpen(false);
      reset();
    },
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'petType', headerName: 'Type', flex: 0.8 },
    { field: 'gender', headerName: 'Gender', flex: 0.7 },
    { field: 'birthDate', headerName: 'Birth date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Profile',
      flex: 0.8,
      renderCell: (params) => (
        <Button component={Link} href={`/pets/${params.row.id}`} size="small">
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Pets"
        subtitle="Pet profiles and health records"
        actionLabel={hasRole('ADMIN') ? 'Add pet' : undefined}
        onAction={hasRole('ADMIN') ? () => setOpen(true) : undefined}
      />
      <DataGrid
        rows={pets}
        columns={columns}
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
      {hasRole('ADMIN') && (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create pet</DialogTitle>
          <Box component="form" onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Name" {...register('name')} />
              <TextField label="Birth date" type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('birthDate')} />
              <TextField label="Type" select {...register('petType')}>
                {['DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <TextField label="Gender" select {...register('gender')}>
                {['MALE', 'FEMALE', 'UNKNOWN'].map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
              <TextField label="Weight (kg)" type="number" {...register('weightKg', { valueAsNumber: true })} />
              <TextField label="Photo URL" {...register('photoUrl')} />
              <TextField label="Owner" select {...register('ownerId')}>
                {owners.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.firstName} {owner.lastName}
                  </MenuItem>
                ))}
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
