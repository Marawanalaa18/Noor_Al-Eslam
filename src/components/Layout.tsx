import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { RandomDhikrPopup } from './RandomDhikrPopup';
import { MiniPlayer } from './MiniPlayer';
import { alquranApi } from '@/utils/api';
import { useNotificationSystem } from '@/hooks/useNotifications';
import { useProgress } from '@/hooks/useProgress';

export function Layout() {
  useNotificationSystem(); // Initialize notifications globally
  const { recordAppOpen } = useProgress();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!hasOpenedRef.current) {
      recordAppOpen();
      hasOpenedRef.current = true;
    }
    alquranApi.get('/meta').then(res => console.log('META:', res.data)).catch(console.error);
  }, [recordAppOpen]);
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-[-1] opacity-5 dark:opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230F3D2E\' fill-opacity=\'1\'%3E%3Cpath d=\'M28 18a12 12 0 0 1-8.5 20.5A12 12 0 1 0 28 18zm8 6l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3l1-3z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
      </div>
      
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <Footer />
      <RandomDhikrPopup />
      <MiniPlayer />
    </div>
  );
}
