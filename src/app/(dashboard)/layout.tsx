'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Layout, LoadingSpinner } from '@/components';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // if (loading) {
  //   return (
  //     <LoadingSpinner 
  //       text="Loading dashboard..." 
  //       fullScreen={true}
  //       size="lg"
  //       color="white"
  //     />
  //   );
  // }

  if (!user) {
    return null; // Will redirect to login
  }

  return <Layout>{children}</Layout>;
}
