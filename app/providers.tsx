'use client';

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <ToastProvider />
      </AuthProvider>
    </ThemeProvider>
  );
}
