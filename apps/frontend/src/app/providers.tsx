/**
 * @author Mahmoud & Gemini & Expert System
 * @description This file sets up all the necessary providers for the application (React Query, etc.).
 * @created 2025-07-08
 * @updated 2025-07-11
 */
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { ChunkLoadRecoveryStrategy } from '@/core/error-management/types';

// إنشاء instance واحدة من QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // لا تعيد المحاولة للأخطاء 4xx
        if (error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 3;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function ChunkErrorRecoverySetup() {
  useEffect(() => {
    const setupChunkErrorRecovery = () => {
      if (typeof window === 'undefined') return;

      // معالجة أخطاء تحميل الـ chunks
      window.addEventListener('error', (event) => {
        if (event.message.includes('Loading chunk') || 
            event.message.includes('ChunkLoadError')) {
          console.warn('Chunk loading failed, attempting recovery...', event.message);
          
          const recovery = new ChunkLoadRecoveryStrategy();
          if (recovery.canRecover(new Error(event.message))) {
            recovery.execute().catch(console.error);
          }
        }
      });

      // معالجة أخطاء الـ Promise المرفوضة
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message && 
            event.reason.message.includes('Loading chunk')) {
          console.warn('Unhandled chunk loading rejection:', event.reason.message);
          
          const recovery = new ChunkLoadRecoveryStrategy();
          if (recovery.canRecover(event.reason)) {
            event.preventDefault(); // منع ظهور الخطأ في الكونسول
            recovery.execute().catch(console.error);
          }
        }
      });

      // تنظيف عدادات إعادة التحميل عند النجاح
      const clearReloadAttempts = () => {
        sessionStorage.removeItem('chunk-reload-attempts');
      };

      // مسح العدادات عند تحميل الصفحة بنجاح
      if (document.readyState === 'complete') {
        clearReloadAttempts();
      } else {
        window.addEventListener('load', clearReloadAttempts);
      }
    };

    setupChunkErrorRecovery();
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChunkErrorRecoverySetup />
      {children}
    </QueryClientProvider>
  );
}