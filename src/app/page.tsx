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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="py-8 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          😱 Scream Therapy
        </h1>
        <p className="text-slate-300 text-lg">
          Release your stress. Completely private. Nothing leaves your browser.
        </p>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {/* Tab navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 rounded-full p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('scream')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'scream'
                  ? 'bg-red-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🎤 Scream
            </button>
            <button
              onClick={() => setActiveTab('vent')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'vent'
                  ? 'bg-purple-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              📝 Vent
            </button>
            <button
              onClick={() => setActiveTab('punch')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'punch'
                  ? 'bg-orange-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🥊 Punch
            </button>
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
        <footer className="mt-8 text-center text-slate-400 text-sm">
          <p>
            Built with privacy as the core requirement.
            <br />
            No data ever leaves your device. 🔒
          </p>
        </footer>
      </main>
    </div>
  );
}
