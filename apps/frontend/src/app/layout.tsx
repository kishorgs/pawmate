import type { Metadata } from 'next';
import { AppProviders } from '@/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'PawMate — Veterinary Clinic Management',
  description: 'Modern veterinary clinic management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
