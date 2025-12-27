/**
 * SCREAM ANALYZER COMPONENT
 * 
 * PRIVACY GUARANTEE:
 * - Microphone audio is analyzed in real-time only
 * - No audio data is recorded, stored, or transmitted
 * - Only volume levels are displayed visually
 * - All processing happens in the browser
 */

'use client';

import { useScreamAnalyzer } from '@/hooks/useScreamAnalyzer';
import { addScreamSession } from '@/lib/memoryStore';
import { saveScreamSession, isLocalStorageEnabled } from '@/lib/indexedDbStore';

export default function ScreamAnalyzer() {
  const {
    isListening,
    volume,
    peakVolume,
    error,
    isSupported,
    startListening,
    stopListening,
  } = useScreamAnalyzer();

  const handleStop = async () => {
    const sessionData = stopListening();
    
    // Save to memory store
    const session = addScreamSession(sessionData.peakVolume, sessionData.duration);
    
    // Optionally save to IndexedDB if enabled
    if (isLocalStorageEnabled()) {
      await saveScreamSession(session);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">
          Microphone access is not supported in this browser.
        </p>
      </div>
    );
  }

  // Calculate visual elements based on volume
  const volumeBarWidth = Math.min(volume, 100);
  const glowIntensity = volume / 100;
  const pulseScale = 1 + (volume / 200);

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
          🎤 Scream Analyzer
        </h2>
        <p className="text-sm text-red-600/70 dark:text-red-300/70">
          Let it all out! Your scream stays in your browser.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Main scream button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isListening ? handleStop : startListening}
          className={`
            relative w-32 h-32 rounded-full font-bold text-white
            transition-all duration-300 ease-out
            ${isListening 
              ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/50' 
              : 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700'
            }
          `}
          style={{
            transform: isListening ? `scale(${pulseScale})` : 'scale(1)',
            boxShadow: isListening 
              ? `0 0 ${30 + volume}px ${10 + volume/2}px rgba(239, 68, 68, ${0.3 + glowIntensity * 0.4})`
              : '0 4px 15px rgba(239, 68, 68, 0.3)',
          }}
        >
          {isListening ? 'STOP' : 'SCREAM!'}
        </button>
      </div>

      {/* Volume visualization */}
      {isListening && (
        <div className="space-y-4">
          <div className="bg-white/50 dark:bg-black/20 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-75"
              style={{ width: `${volumeBarWidth}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-red-700 dark:text-red-300">
            <span>Current: {volume}%</span>
            <span>Peak: {peakVolume}%</span>
          </div>

          {/* Intensity feedback */}
          <div className="text-center">
            {volume < 20 && <p className="text-gray-500">Whisper... go louder!</p>}
            {volume >= 20 && volume < 50 && <p className="text-orange-500">Getting there...</p>}
            {volume >= 50 && volume < 75 && <p className="text-orange-600 font-semibold">LOUDER!</p>}
            {volume >= 75 && <p className="text-red-600 font-bold text-xl animate-pulse">YESSSSS! 🔥</p>}
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <p className="text-xs text-center text-red-600/50 dark:text-red-300/50 mt-6">
        🔒 Audio is analyzed in real-time only. Nothing is recorded or stored.
      </p>
    </div>
  );
}
