/**
 * @author Mahmoud & Gemini
 * @description This file sets up all the necessary providers for the application (React Query, etc.).
 * @created 2025-07-08
 */
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// إنشاء instance واحدة من QueryClient
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}