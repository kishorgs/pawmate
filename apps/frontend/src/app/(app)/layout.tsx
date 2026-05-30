import { RequireAuth } from '@/components/auth/RequireAuth';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RequireAuth>{children}</RequireAuth>
    </AuthProvider>
  );
}
