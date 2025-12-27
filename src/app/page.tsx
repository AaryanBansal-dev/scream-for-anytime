/**
 * SCREAM THERAPY - STRESS RELIEF WEBSITE
 * 
 * PRIVACY GUARANTEE:
 * All activity happens locally in your browser.
 * No data is sent or stored on any server.
 * Refreshing the page permanently deletes everything.
 * 
 * This page uses "use client" to ensure all rendering happens client-side.
 * There are no API routes, server actions, or middleware.
 */

'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { initializeMemoryStore } from '@/lib/memoryStore';

// Dynamic imports to ensure client-side only rendering
const ScreamAnalyzer = dynamic(() => import('@/components/ScreamAnalyzer'), { ssr: false });
const VentBox = dynamic(() => import('@/components/VentBox'), { ssr: false });
const StressToy = dynamic(() => import('@/components/StressToy'), { ssr: false });
const PrivacyNotice = dynamic(() => import('@/components/PrivacyNotice'), { ssr: false });

// Custom hook to safely detect client-side rendering
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scream' | 'vent' | 'punch'>('scream');
  const isClient = useIsClient();

  // Initialize memory store on client
  useEffect(() => {
    initializeMemoryStore();
  }, []);

  // Return null during SSR to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  const tabs = [
    { id: 'scream' as const, label: 'Scream', icon: '🎤', color: 'from-rose-500 to-pink-600' },
    { id: 'vent' as const, label: 'Vent', icon: '✍️', color: 'from-violet-500 to-purple-600' },
    { id: 'punch' as const, label: 'Punch', icon: '👊', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen mesh-gradient noise">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-3/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-16 pb-8 px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/25">
            <span className="text-3xl">😤</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Scream Therapy
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Release your stress. Completely private.
            <span className="text-zinc-500"> Nothing leaves your browser.</span>
          </p>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto px-4 pb-12">
          {/* Tab navigation */}
          <div className="flex justify-center mb-8">
            <div className="glass-card rounded-2xl p-1.5 flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                    ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="mb-8">
            {activeTab === 'scream' && <ScreamAnalyzer />}
            {activeTab === 'vent' && <VentBox />}
            {activeTab === 'punch' && <StressToy />}
          </div>

          {/* Privacy notice */}
          <PrivacyNotice />

          {/* Footer */}
          <footer className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-500">
                100% Local • Zero tracking • Privacy first
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
