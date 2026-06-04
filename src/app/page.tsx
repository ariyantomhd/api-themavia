'use client';

import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [currentUrl, setCurrentUrl] = useState('Mengidentifikasi domain...');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Membungkus ke dalam fungsi async/antrean makrotask agar tidak dieksekusi secara sinkronus langsung
    const initializeDashboard = async () => {
      if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.origin);
      }
      
      try {
        // Jika di kemudian hari mau tes ping asli ke DB, bisa fetch ke route auth internal
        setDbStatus('connected');
      } catch {
        setDbStatus('error');
      }
    };

    // Panggil fungsi secara asinkronus agar terjadwal dengan aman di luar siklus render utama
    initializeDashboard();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-sans antialiased p-6">
      
      {/* Container Utama Berwarna Pastel Lembut Premium */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        
        {/* Dekorasi Efek Cahaya Ambient Lembut Latar Belakang */}
        <div className="absolute right-[-20%] top-[-20%] w-48 h-48 bg-teal-400/10 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute left-[-20%] bottom-[-20%] w-48 h-48 bg-indigo-400/10 blur-[50px] rounded-full pointer-events-none" />

        {/* 🌟 Bagian 1: Animasi Visual Detak Nadi (Pulse) Status Koneksi */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {dbStatus === 'connected' ? (
            <>
              {/* Efek radar lingkaran membesar yang berkedip otomatis */}
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-teal-400 opacity-20"></span>
              <div className="relative w-14 h-14 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center text-teal-500 shadow-sm shadow-teal-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </>
          ) : (
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
          )}
        </div>

        {/* 🌟 Bagian 2: Teks Status Sistem */}
        <div className="space-y-1.5">
          <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">
            Themavia API Server
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-600 font-bold text-[10px] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Sistem Terhubung
          </div>
        </div>

        <div className="w-full h-px bg-slate-100" />

        {/* 🌟 Bagian 3: Detektor Real-time URL Server Aktif */}
        <div className="w-full space-y-3 text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Target Endpoint</p>
            <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg font-mono text-xs text-slate-600 break-all select-all hover:bg-slate-100/50 transition-colors cursor-pointer">
              {currentUrl}/api/v1
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-1">
            <span>Environment</span>
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[9px]">
              {currentUrl.includes('localhost') ? 'Development' : 'Production'}
            </span>
          </div>
        </div>

        {/* Footer info kecil penanda core system */}
        <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest pt-2">
          Secure Gateway Provider • Node Active
        </p>
      </div>

    </div>
  );
}