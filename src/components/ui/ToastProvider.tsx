'use client';

import React from 'react';
import { SnackbarProvider } from 'notistack';

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={4000}
    >
      {children}
    </SnackbarProvider>
  );
}
