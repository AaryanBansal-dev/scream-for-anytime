/**
 * PRIVACY NOTICE COMPONENT
 * 
 * This component displays the privacy guarantees to users
 * and provides controls for panic wipe and optional local storage.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { panicWipe, initializeMemoryStore } from '@/lib/memoryStore';
import { 
  enableLocalStorage, 
  disableLocalStorage, 
  isLocalStorageEnabled,
  clearAllStoredData 
} from '@/lib/indexedDbStore';

export default function PrivacyNotice() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStorageEnabled, setLocalStorageEnabled] = useState(() => isLocalStorageEnabled());
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wiped, setWiped] = useState(false);

  // Initialize memory store on mount
  useEffect(() => {
    initializeMemoryStore();
  }, []);

  const handlePanicWipe = useCallback(async () => {
    // Wipe all memory
    panicWipe();
    
    // Also clear IndexedDB if enabled
    if (localStorageEnabled) {
      await clearAllStoredData();
    }
    
    setWiped(true);
    setShowWipeConfirm(false);
    
    // Reset the wiped message after a few seconds
    setTimeout(() => setWiped(false), 3000);
  }, [localStorageEnabled]);

  const toggleLocalStorage = useCallback(async () => {
    if (localStorageEnabled) {
      await disableLocalStorage();
      setLocalStorageEnabled(false);
    } else {
      const success = await enableLocalStorage();
      setLocalStorageEnabled(success);
    }
  }, [localStorageEnabled]);

  return (
    <div className="glass-card rounded-3xl p-6">
      {/* Main privacy statement */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🔒</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1">
            100% Private & Local
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            All activity happens locally in your browser. Nothing is sent to any server. Refresh to erase everything.
          </p>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
        {isExpanded ? 'Hide details' : 'Show privacy details'}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Privacy guarantees */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
            <p className="text-sm font-medium text-zinc-300 mb-3">Privacy Guarantees</p>
            <ul className="space-y-2">
              {[
                'No server-side storage or processing',
                'No API routes or server actions',
                'No analytics, tracking, or logging',
                'CSP blocks all outbound connections',
                'Audio analyzed in real-time only',
                'Voice-to-text uses browser API',
                'All data in-memory by default',
                'Auto-wipe on page refresh',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Local storage opt-in */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Local Persistence</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Save to IndexedDB (still local-only)
                </p>
              </div>
              <button
                onClick={toggleLocalStorage}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-300
                  ${localStorageEnabled 
                    ? 'bg-emerald-500' 
                    : 'bg-zinc-700'
                  }
                `}
              >
                <span
                  className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300
                    ${localStorageEnabled ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            {localStorageEnabled && (
              <p className="text-xs text-amber-400/80 mt-3">
                ⚠ Data persists until you clear it
              </p>
            )}
          </div>
        </div>
      )}

      {/* Panic Wipe Button */}
      <div className="mt-6 pt-6 border-t border-white/5">
        {!showWipeConfirm ? (
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm
              bg-red-500/10 text-red-400 border border-red-500/20
              hover:bg-red-500/20 transition-all duration-300
              flex items-center justify-center gap-2"
          >
            <span>🚨</span>
            Panic Wipe – Delete Everything
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-zinc-400">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePanicWipe}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-sm
                  bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-sm
                  bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {wiped && (
          <p className="text-center text-sm text-emerald-400 mt-3 animate-pulse">
            ✓ All data wiped
          </p>
        )}
      </div>
    </div>
  );
}
