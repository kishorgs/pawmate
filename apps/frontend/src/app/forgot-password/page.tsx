'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material';
import { useAuth } from '@/lib/auth/AuthProvider';

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      setError('Unable to send reset email.');
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Reset password
          </Typography>
          {sent ? (
            <Alert severity="success">Check your email for a reset link.</Alert>
          ) : (
            <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" {...register('email')} />
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Send reset link
              </Button>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Link href="/login">Back to sign in</Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
