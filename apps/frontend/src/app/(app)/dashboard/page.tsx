'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/api/client';
import type { DashboardSummary } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => apiRequest<DashboardSummary>('/dashboard/summary'),
  });

  const statCards = [
    { label: 'Owners', value: data?.totals.owners, show: user?.role === 'ADMIN' },
    { label: 'Pets', value: data?.totals.pets, show: true },
    { label: 'Veterinarians', value: data?.totals.veterinarians, show: user?.role === 'ADMIN' },
    { label: 'Upcoming Appointments', value: data?.totals.upcomingAppointments, show: true },
    { label: 'Vaccination Reminders', value: data?.totals.upcomingVaccinations, show: true },
    { label: 'Medication Reminders', value: data?.totals.upcomingMedications, show: true },
  ].filter((card) => card.show);

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Clinic overview and upcoming care" />
      {isLoading ? (
        <Typography>Loading dashboard…</Typography>
      ) : (
        <Grid container spacing={2}>
          {statCards.map((card) => (
            <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {card.label}
                  </Typography>
                  <Typography variant="h3">{card.value ?? 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming appointments
                </Typography>
                <List dense>
                  {(data?.upcomingAppointments ?? []).map((appointment) => (
                    <ListItem key={appointment.id} divider>
                      <ListItemText
                        primary={appointment.reason}
                        secondary={format(new Date(appointment.scheduledAt), 'PPp')}
                      />
                    </ListItem>
                  ))}
                  {!data?.upcomingAppointments?.length && (
                    <Typography color="text.secondary">No upcoming appointments</Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming reminders
                </Typography>
                <List dense>
                  {(data?.upcomingReminders ?? []).map((reminder) => (
                    <ListItem key={reminder.id} divider>
                      <ListItemText
                        primary={reminder.title}
                        secondary={format(new Date(reminder.nextOccurrence), 'PP')}
                      />
                      <StatusChip status={reminder.status} />
                    </ListItem>
                  ))}
                  {!data?.upcomingReminders?.length && (
                    <Typography color="text.secondary">No upcoming reminders</Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
