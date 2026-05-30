'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { apiRequest } from '@/lib/api/client';
import type { EnrichedReminder, PetProfile, VisitRecord } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';

export default function PetProfilePage() {
  const params = useParams<{ id: string }>();
  const petId = params.id;

  const { data: pet } = useQuery({
    queryKey: ['pets', petId],
    queryFn: () => apiRequest<PetProfile>(`/pets/${petId}`),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits', petId],
    queryFn: () => apiRequest<VisitRecord[]>(`/visits?petId=${petId}`),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders', petId],
    queryFn: () => apiRequest<EnrichedReminder[]>(`/reminders?petId=${petId}`),
  });

  if (!pet) return <Typography>Loading pet profile…</Typography>;

  return (
    <Box>
      <PageHeader title={pet.name} subtitle={`${pet.petType} · ${pet.gender}`} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={pet.photoUrl || undefined}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.light' }}
              >
                {pet.name[0]}
              </Avatar>
              <Typography>Born {pet.birthDate}</Typography>
              {pet.weightKg != null && <Typography>Weight: {pet.weightKg} kg</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Visit history</Typography>
              {visits.map((visit) => (
                <Box key={visit.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontWeight: 600 }}>{visit.visitDate}</Typography>
                  <Typography>{visit.description}</Typography>
                  {visit.diagnosis && <Typography color="text.secondary">Diagnosis: {visit.diagnosis}</Typography>}
                </Box>
              ))}
              {!visits.length && <Typography color="text.secondary">No visits recorded</Typography>}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active reminders</Typography>
              {reminders.map((reminder) => (
                <Typography key={reminder.id}>
                  {reminder.title} — {reminder.type} ({reminder.status})
                </Typography>
              ))}
              {!reminders.length && <Typography color="text.secondary">No reminders</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
