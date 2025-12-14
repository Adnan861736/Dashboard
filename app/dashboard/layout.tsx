'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Header } from '@/components/organisms/Header';
import { useAuth } from '@/lib/auth-context';
import { LoadingPage } from '@/components/atoms/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  console.log('DashboardLayout render - user:', user, 'loading:', loading, 'mounted:', mounted);

  useEffect(() => {
    console.log('DashboardLayout mounted');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      // Only redirect if we're sure there's no user after loading
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('Dashboard check - token:', !!token, 'savedUser:', !!savedUser, 'user:', !!user);

      if (!token || !savedUser) {
        window.location.replace('/login');
      }
    }
  }, [user, loading, mounted]);

  // Show loading spinner while checking auth
  if (!mounted || loading) {
    return <LoadingPage />;
  }

  // If user exists, show dashboard
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-background rtl relative">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If we have token but no user yet (edge case), keep showing loading
  const token = localStorage.getItem('token');
  if (token) {
    return <LoadingPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background rtl relative">

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
