/**
 * SCREAM ANALYZER HOOK
 * 
 * PRIVACY GUARANTEE:
 * - Uses navigator.mediaDevices.getUserMedia for microphone access
 * - Audio data is analyzed in REAL-TIME using Web Audio API
 * - NO audio is recorded, stored, or transmitted
 * - Only amplitude/volume levels are extracted for visualization
 * - Audio stream is automatically stopped when component unmounts
 * 
 * The audio never leaves the browser - it goes directly from the microphone
 * to the AnalyserNode and is immediately discarded after visualization.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface ScreamAnalyzerState {
  isListening: boolean;
  volume: number;
  peakVolume: number;
  error: string | null;
  isSupported: boolean;
}

export function useScreamAnalyzer() {
  const [state, setState] = useState<ScreamAnalyzerState>({
    isListening: false,
    volume: 0,
    peakVolume: 0,
    error: null,
    isSupported: typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const peakVolumeRef = useRef<number>(0);

  /**
   * Start listening to the microphone
   */
  const startListening = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState(prev => ({
        ...prev,
        error: 'Microphone access is not supported in this browser',
      }));
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser (NOT to destination - no playback)
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Reset peak volume for new session
      peakVolumeRef.current = 0;
      startTimeRef.current = Date.now();

      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        volume: 0,
        peakVolume: 0,
      }));

      // Start analyzing with inline function to avoid circular dependency
      const analyzeAudio = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume (0-255 range, normalized to 0-100)
        const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        const normalizedVolume = Math.round((average / 255) * 100);

        // Track peak volume
        if (normalizedVolume > peakVolumeRef.current) {
          peakVolumeRef.current = normalizedVolume;
        }

        setState(prev => ({
          ...prev,
          volume: normalizedVolume,
          peakVolume: peakVolumeRef.current,
        }));

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Stop listening and clean up resources
   * Returns session data for optional storage
   */
  const stopListening = useCallback(() => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    const duration = Date.now() - startTimeRef.current;
    const peakVolume = peakVolumeRef.current;

    setState(prev => ({
      ...prev,
      isListening: false,
      volume: 0,
    }));

    return { peakVolume, duration };
  }, []);

  /**
   * Clean up on unmount
   * PRIVACY: Ensures all audio resources are released
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
  };
}
