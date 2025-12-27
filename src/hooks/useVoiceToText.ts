/**
 * VOICE TO TEXT HOOK
 * 
 * PRIVACY GUARANTEE:
 * - Uses the Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * - Transcription is processed by the browser's built-in speech engine
 * - NO external API calls are made for transcription
 * - Results remain ONLY in browser memory
 * - Audio is NOT recorded or stored
 * 
 * Note: Web Speech API processing may vary by browser:
 * - Some browsers process speech locally
 * - Some may send audio to their cloud for processing (e.g., Chrome)
 * - Users should be aware of their browser's speech API implementation
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export interface VoiceToTextState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

// Check support at module level for initial state
const checkSupport = () => {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export function useVoiceToText() {
  const [state, setState] = useState<VoiceToTextState>(() => ({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: checkSupport(),
  }));

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  /**
   * Start voice recognition
   */
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition is not supported in this browser',
      }));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
      }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Don't treat 'no-speech' as an error - it's normal
      if (event.error === 'no-speech') return;
      
      setState(prev => ({
        ...prev,
        error: `Speech recognition error: ${event.error}`,
        isListening: false,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
    };

    try {
      recognition.start();
    } catch (error) {
      // Log error for debugging while still providing user-friendly message
      console.error('Speech recognition start failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition',
      }));
    }
  }, []);

  /**
   * Stop voice recognition
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  /**
   * Clear the transcript
   */
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
    }));
  }, []);

  /**
   * Get the current full transcript
   */
  const getFullTranscript = useCallback(() => {
    return state.transcript + state.interimTranscript;
  }, [state.transcript, state.interimTranscript]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    clearTranscript,
    getFullTranscript,
  };
}
