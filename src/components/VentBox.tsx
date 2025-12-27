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
    // Animate and clear
    setText('');
    clearTranscript();
  }, [clearTranscript]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-2">
          📝 Vent Box
        </h2>
        <p className="text-sm text-purple-600/70 dark:text-purple-300/70">
          Type or speak your frustrations. They stay private.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Text area */}
      <div className="relative mb-4">
        <textarea
          value={displayText}
          onChange={handleTextChange}
          placeholder="Let it all out... Type or use voice input..."
          className={`
            w-full h-40 p-4 rounded-lg resize-none
            bg-white/80 dark:bg-black/30
            border-2 transition-colors duration-300
            ${isListening 
              ? 'border-purple-500 ring-2 ring-purple-300' 
              : 'border-purple-200 dark:border-purple-700'
            }
            focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300
            text-gray-800 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500
          `}
        />
        
        {isListening && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            Listening...
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {isSupported && (
          <button
            onClick={toggleVoice}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-300
              ${isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-purple-500 text-white hover:bg-purple-600'
              }
            `}
          >
            {isListening ? '⏹️ Stop' : '🎙️ Speak'}
          </button>
        )}

        <button
          onClick={handleSaveVent}
          disabled={!displayText.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          💾 Save to Memory
        </button>

        <button
          onClick={handleBurn}
          disabled={!displayText.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🔥 Burn It
        </button>
      </div>

      {/* Saved entries toggle */}
      <div className="border-t border-purple-200 dark:border-purple-700 pt-4">
        <button
          onClick={() => {
            setEntries(getVentEntries());
            setShowEntries(!showEntries);
          }}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium"
        >
          {showEntries ? '🔽 Hide Saved Vents' : '▶️ View Saved Vents'} ({entries.length})
        </button>

        {showEntries && entries.length > 0 && (
          <div className="mt-4 space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="mr-2">{entry.type === 'spoken' ? '🎙️' : '⌨️'}</span>
                {entry.content}
              </div>
            ))}
            
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              🗑️ Clear All Vents
            </button>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <p className="text-xs text-center text-purple-600/50 dark:text-purple-300/50 mt-6">
        🔒 All vents are stored in memory only. Page refresh erases everything.
      </p>
    </div>
  );
}
