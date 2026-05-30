'use client';

import { useQuery } from '@tanstack/react-query';
import { Box } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/api/client';
import type { EnrichedReminder } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';

export default function VaccinationsPage() {
  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ['reminders', 'vaccination'],
    queryFn: () => apiRequest<EnrichedReminder[]>('/reminders?type=VACCINATION'),
  });

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Vaccination', flex: 1.2 },
    { field: 'petId', headerName: 'Pet ID', flex: 1 },
    {
      field: 'nextOccurrence',
      headerName: 'Next due',
      flex: 1,
      valueFormatter: (v) => (v ? format(new Date(String(v)), 'PP') : '—'),
    },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p) => <StatusChip status={String(p.value)} /> },
  ];

  return (
    <Box>
      <PageHeader title="Vaccinations" subtitle="Vaccination schedules and upcoming doses" />
      <DataGrid rows={vaccinations} columns={columns} loading={isLoading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
    </Box>
  );
}
