'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/client';
import type { OwnerProfile } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/lib/auth/AuthProvider';

const ownerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email(),
});

export default function OwnersPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof ownerSchema>>({
    resolver: zodResolver(ownerSchema),
  });

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ['owners', search],
    queryFn: () =>
      apiRequest<OwnerProfile[]>(`/owners${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    enabled: hasRole('ADMIN'),
  });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof ownerSchema>) =>
      apiRequest<OwnerProfile>('/owners', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      setOpen(false);
      reset();
    },
  });

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First name', flex: 1 },
    { field: 'lastName', headerName: 'Last name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.2 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'city', headerName: 'City', flex: 1 },
  ];

  if (!hasRole('ADMIN')) {
    return <Box>Owner management is available to clinic administrators only.</Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Owners"
        subtitle="Manage pet owner records"
        actionLabel="Add owner"
        onAction={() => setOpen(true)}
      />
      <TextField
        label="Search owners"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 400 }}
      />
      <DataGrid
        rows={owners}
        columns={columns}
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create owner</DialogTitle>
        <Box component="form" onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First name" {...register('firstName')} error={Boolean(errors.firstName)} />
            <TextField label="Last name" {...register('lastName')} error={Boolean(errors.lastName)} />
            <TextField label="Address" {...register('address')} />
            <TextField label="City" {...register('city')} />
            <TextField label="Phone" {...register('phone')} />
            <TextField label="Email" {...register('email')} error={Boolean(errors.email)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
