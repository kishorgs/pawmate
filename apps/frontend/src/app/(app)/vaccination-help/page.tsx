'use client';

import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';

export default function VaccinationHelpPage() {
  return (
    <Box>
      <PageHeader
        title="Vaccination Help"
        subtitle="Learn how to track vaccinations and set reminders for your pets"
      />
      <Typography paragraph>
        Vaccination help gives you guidance on how to keep your pets safe and up to date with their vaccination schedule.
      </Typography>
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        How to add a vaccination reminder
      </Typography>
      <Typography paragraph>
        1. Open the <strong>Reminders</strong> page.
      </Typography>
      <Typography paragraph>
        2. Click the button to create a new reminder.
      </Typography>
      <Typography paragraph>
        3. Set the reminder type to <strong>Vaccination</strong> and choose the pet, date, and repeat settings.
      </Typography>
      <Typography paragraph>
        4. Save the reminder. The system will then show upcoming vaccination dates on the dashboard and in the vaccination list.
      </Typography>
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Where to find vaccination details
      </Typography>
      <Typography paragraph>
        Use the <strong>Vaccinations</strong> page to view all scheduled vaccinations and follow-up doses.
        You can also manage the vaccination status from the reminders section.
      </Typography>
    </Box>
  );
}
