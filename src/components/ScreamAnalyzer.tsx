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
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 text-amber-400">
          <span className="text-xl">⚠️</span>
          <p className="text-sm">Microphone access is not supported in this browser.</p>
        </div>
      </div>
    );
  }

  // Calculate visual elements based on volume
  const volumeBarWidth = Math.min(volume, 100);
  const ringScale = 1 + (volume / 100) * 0.3;
  const glowOpacity = 0.2 + (volume / 100) * 0.6;

  return (
    <div className="glass-card rounded-3xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          Scream Analyzer
        </h2>
        <p className="text-sm text-zinc-500">
          Let it all out. Your audio never leaves your device.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Main scream button */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Animated rings when listening */}
          {isListening && (
            <>
              <div 
                className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"
                style={{ animationDuration: '1.5s' }}
              />
              <div 
                className="absolute inset-0 rounded-full border-2 border-rose-500/30"
                style={{ transform: `scale(${ringScale})`, transition: 'transform 0.1s ease-out' }}
              />
            </>
          )}
          
          <button
            onClick={isListening ? handleStop : startListening}
            className={`
              relative w-36 h-36 rounded-full font-semibold text-white text-lg
              transition-all duration-300 ease-out
              ${isListening 
                ? 'bg-gradient-to-br from-rose-500 to-pink-600' 
                : 'bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-rose-500 hover:to-pink-600'
              }
            `}
            style={{
              boxShadow: isListening 
                ? `0 0 ${40 + volume}px rgba(244, 63, 94, ${glowOpacity})`
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {isListening ? (
              <span className="flex flex-col items-center">
                <span className="text-3xl mb-1">🛑</span>
                <span className="text-xs uppercase tracking-wider">Stop</span>
              </span>
            ) : (
              <span className="flex flex-col items-center">
                <span className="text-3xl mb-1">🎤</span>
                <span className="text-xs uppercase tracking-wider">Start</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Volume visualization */}
      {isListening && (
        <div className="space-y-6">
          {/* Volume bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span id="volume-label">Volume</span>
              <span>{volume}%</span>
            </div>
            <div
              role="progressbar"
              aria-labelledby="volume-label"
              aria-valuenow={volume}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 rounded-full bg-zinc-800 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 transition-all duration-75"
                style={{ width: `${volumeBarWidth}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{volume}%</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Current</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-400">{peakVolume}%</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Peak</p>
            </div>
          </div>

          {/* Intensity feedback */}
          <div className="text-center" aria-live="polite" aria-atomic="true">
            {volume < 20 && (
              <p className="text-zinc-500 text-sm">Whisper detected... go louder!</p>
            )}
            {volume >= 20 && volume < 50 && (
              <p className="text-amber-400 text-sm">Getting warmer... 🔥</p>
            )}
            {volume >= 50 && volume < 75 && (
              <p className="text-orange-400 font-medium">That&apos;s it! Keep going!</p>
            )}
            {volume >= 75 && (
              <p className="text-rose-400 font-bold text-lg animate-pulse">
                MAXIMUM RELEASE! 🌋
              </p>
            )}
          </div>
        </div>
      )}

      {/* Privacy badge */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400">Audio analyzed locally only</span>
        </div>
      </div>
    </div>
  );
}
