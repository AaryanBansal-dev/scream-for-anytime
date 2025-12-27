/**
 * VENT BOX COMPONENT
 * 
 * PRIVACY GUARANTEE:
 * - All text (typed or spoken) remains in browser memory only
 * - No data is ever sent to any server
 * - Voice-to-text uses browser's built-in Web Speech API
 * - Data is erased on page refresh/close
 */

'use client';

import { useState, useCallback } from 'react';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { addVentEntry, getVentEntries, clearVentEntries } from '@/lib/memoryStore';
import { saveVentEntry, isLocalStorageEnabled } from '@/lib/indexedDbStore';

export default function VentBox() {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<Array<{ id: string; content: string; type: string }>>([]);
  const [showEntries, setShowEntries] = useState(false);
  const [burnAnimation, setBurnAnimation] = useState(false);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceToText();

  // Combine typed text with voice transcript
  const displayText = text + (isListening ? (transcript + interimTranscript) : transcript);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleSaveVent = useCallback(async () => {
    const content = displayText.trim();
    if (!content) return;

    const entry = addVentEntry(content, isListening ? 'spoken' : 'typed');
    
    // Optionally save to IndexedDB if enabled
    if (isLocalStorageEnabled()) {
      await saveVentEntry(entry);
    }

    // Clear inputs
    setText('');
    clearTranscript();
    
    // Update entries display
    setEntries(getVentEntries());
  }, [displayText, isListening, clearTranscript]);

  const handleClearAll = useCallback(() => {
    clearVentEntries();
    setEntries([]);
    setText('');
    clearTranscript();
  }, [clearTranscript]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleBurn = useCallback(() => {
    setBurnAnimation(true);
    setTimeout(() => {
      setText('');
      clearTranscript();
      setBurnAnimation(false);
    }, 500);
  }, [clearTranscript]);

  return (
    <div className="glass-card rounded-3xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          Vent Box
        </h2>
        <p className="text-sm text-zinc-500">
          Type or speak your frustrations. Everything stays private.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Text area */}
      <div className="relative mb-6">
        <textarea
          value={displayText}
          onChange={handleTextChange}
          placeholder="Let it all out..."
          className={`
            w-full h-48 p-5 rounded-2xl resize-none
            bg-zinc-900/50 border transition-all duration-300
            ${isListening 
              ? 'border-violet-500/50 ring-2 ring-violet-500/20' 
              : 'border-white/10 hover:border-white/20'
            }
            ${burnAnimation ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
            text-white placeholder-zinc-600 text-base
          `}
        />
        
        {isListening && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-xs text-violet-300">Listening</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {isSupported && (
          <button
            onClick={toggleVoice}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-300
              ${isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30'
              }
            `}
          >
            {isListening ? '⏹ Stop' : '🎙 Speak'}
          </button>
        )}

        <button
          onClick={handleSaveVent}
          disabled={!displayText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
            bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
            hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-300"
        >
          💾 Save
        </button>

        <button
          onClick={handleBurn}
          disabled={!displayText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
            bg-orange-500/20 text-orange-400 border border-orange-500/30
            hover:bg-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-300"
        >
          🔥 Burn
        </button>
      </div>

      {/* Saved entries toggle */}
      <div className="border-t border-white/10 pt-6">
        <button
          onClick={() => {
            setEntries(getVentEntries());
            setShowEntries(!showEntries);
          }}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <span className={`transition-transform ${showEntries ? 'rotate-90' : ''}`}>▶</span>
          Saved Vents ({entries.length})
        </button>

        {showEntries && entries.length > 0 && (
          <div className="mt-4 space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-zinc-800/50 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{entry.type === 'spoken' ? '🎙' : '⌨️'}</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{entry.content}</p>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleClearAll}
              className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {showEntries && entries.length === 0 && (
          <p className="mt-4 text-sm text-zinc-600">No saved vents yet.</p>
        )}
      </div>

      {/* Privacy badge */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400">In-memory only • Refresh to erase</span>
        </div>
      </div>
    </div>
  );
}
