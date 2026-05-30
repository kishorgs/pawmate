'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/lib/auth/AuthProvider';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signInEmail, isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace('/dashboard');
  }, [isReady, isAuthenticated, router]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signInEmail(values.email, values.password);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom color="primary">
            PawMate
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your clinic account
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
            <TextField label="Password" type="password" {...register('password')} error={Boolean(errors.password)} helperText={errors.password?.message} />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Sign in
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Link href="/forgot-password">Forgot password?</Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
