'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          maxWidth: '450px',
        },
        success: {
          duration: 3500,
          style: {
            background: 'hsl(var(--success) / 0.1)',
            borderColor: 'hsl(var(--success) / 0.5)',
            color: 'hsl(var(--foreground))',
          },
          iconTheme: {
            primary: 'hsl(var(--success))',
            secondary: 'white',
          },
        },
        error: {
          duration: 4500,
          style: {
            background: 'hsl(var(--destructive) / 0.1)',
            borderColor: 'hsl(var(--destructive) / 0.5)',
            color: 'hsl(var(--foreground))',
          },
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'white',
          },
        },
        loading: {
          style: {
            background: 'hsl(var(--primary) / 0.1)',
            borderColor: 'hsl(var(--primary) / 0.5)',
            color: 'hsl(var(--foreground))',
          },
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
