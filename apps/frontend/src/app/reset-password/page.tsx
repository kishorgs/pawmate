'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material';
import { useAuth } from '@/lib/auth/AuthProvider';

const schema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode') ?? '';
  const { confirmPasswordReset } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!oobCode) {
      setError('Invalid reset link.');
      return;
    }
    setError(null);
    try {
      await confirmPasswordReset(oobCode, password);
      setDone(true);
    } catch {
      setError('Unable to reset password. The link may have expired.');
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Set new password
          </Typography>
          {done ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password updated. <Link href="/login">Sign in</Link>
            </Alert>
          ) : (
            <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="New password" type="password" {...register('password')} error={Boolean(errors.password)} />
              <TextField label="Confirm password" type="password" {...register('confirmPassword')} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword?.message} />
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Update password
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
