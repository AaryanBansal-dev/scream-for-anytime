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
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 shadow-sm">
      {/* Main privacy statement */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div className="flex-1">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-1">
            100% Private & Local
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            All activity happens locally in your browser.
            No data is sent or stored on any server.
            Refreshing the page permanently deletes everything.
          </p>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 font-medium"
      >
        {isExpanded ? '▼ Hide Details' : '▶ Show Privacy Details'}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm text-emerald-700 dark:text-emerald-300">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2">
            <p className="font-semibold">🛡️ Privacy Guarantees:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>No server-side storage or processing</li>
              <li>No API routes or server actions</li>
              <li>No analytics, tracking, or logging</li>
              <li>Content Security Policy blocks all outbound connections</li>
              <li>Audio is analyzed in real-time only, never recorded</li>
              <li>Voice-to-text uses browser-native Web Speech API</li>
              <li>All data is in-memory (RAM) by default</li>
              <li>Page refresh/close wipes everything automatically</li>
            </ul>
          </div>

          {/* Local storage opt-in */}
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">💾 Optional Local Persistence</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Save vents to your browser&apos;s IndexedDB (still local-only)
                </p>
              </div>
              <button
                onClick={toggleLocalStorage}
                className={`
                  relative w-14 h-7 rounded-full transition-colors duration-300
                  ${localStorageEnabled 
                    ? 'bg-emerald-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
              >
                <span
                  className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300
                    ${localStorageEnabled ? 'translate-x-8' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            {localStorageEnabled && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                ⚠️ Data will persist across sessions until you clear it or disable this option.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Panic Wipe Button */}
      <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-700">
        {!showWipeConfirm ? (
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            🚨 Panic Wipe - Delete Everything Now
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-red-600 dark:text-red-400 font-medium">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePanicWipe}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Wipe Everything
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {wiped && (
          <p className="text-center text-emerald-600 dark:text-emerald-400 font-medium mt-2 animate-pulse">
            ✅ All data has been wiped!
          </p>
        )}
      </div>
    </div>
  );
}
