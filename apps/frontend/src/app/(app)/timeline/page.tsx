'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/api/client';
import type { EnrichedReminder, PetProfile, VisitRecord } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  kind: 'registration' | 'visit' | 'vaccination' | 'medication';
}

export default function HealthTimelinePage() {
  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => apiRequest<PetProfile[]>('/pets'),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => apiRequest<VisitRecord[]>('/visits'),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => apiRequest<EnrichedReminder[]>('/reminders'),
  });

  const events = useMemo(() => {
    const timeline: TimelineEvent[] = [];
    for (const pet of pets) {
      timeline.push({
        id: `reg-${pet.id}`,
        date: pet.createdAt,
        title: `${pet.name} registered`,
        description: `${pet.petType} joined the clinic`,
        kind: 'registration',
      });
    }
    for (const visit of visits) {
      timeline.push({
        id: `visit-${visit.id}`,
        date: visit.visitDate,
        title: 'Clinical visit',
        description: visit.description,
        kind: 'visit',
      });
    }
    for (const reminder of reminders) {
      timeline.push({
        id: `reminder-${reminder.id}`,
        date: reminder.startDate,
        title: reminder.title,
        description: `${reminder.type} schedule · ${reminder.status}`,
        kind: reminder.type === 'VACCINATION' ? 'vaccination' : 'medication',
      });
    }
    return timeline.sort((a, b) => b.date.localeCompare(a.date));
  }, [pets, visits, reminders]);

  return (
    <Box>
      <PageHeader title="Pet Health Timeline" subtitle="Chronological care history across your pets" />
      <Card>
        <CardContent>
          <Stepper orientation="vertical" nonLinear>
            {events.map((event) => (
              <Step key={event.id} active expanded>
                <StepLabel>{format(new Date(event.date), 'PP')}</StepLabel>
                <StepContent>
                  <Typography sx={{ fontWeight: 600 }}>{event.title}</Typography>
                  <Typography color="text.secondary">{event.description}</Typography>
                </StepContent>
              </Step>
            ))}
            {!events.length && <Typography color="text.secondary">No timeline events yet</Typography>}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
}
