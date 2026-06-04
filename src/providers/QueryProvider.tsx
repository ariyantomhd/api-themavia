// src/providers/QueryProvider.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // 🌟 Mengunci instance QueryClient di dalam useState 
  // Supaya client tidak jebol/terbuat ulang setiap kali Next.js melakukan re-render (SSR/HMR)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,     // Data aman di cache selama 5 menit
        gcTime: 1000 * 60 * 10,        // Sampah cache otomatis dibersihkan setelah 10 menit
        refetchOnWindowFocus: false,   // Anti auto-fetch ulang kalau Abang cuma sekadar pindah tab VS Code
        retry: 1,                      // Kalau API gagal, coba tembak ulang 1 kali saja sebelum melempar eror
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}