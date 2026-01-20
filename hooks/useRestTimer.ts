/**
 * useRestTimer Hook
 *
 * Manages rest timer countdown functionality with pause/resume,
 * audio/vibration notifications, and auto-start capabilities.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRestTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  totalTime: number;
  progress: number;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
}

interface UseRestTimerOptions {
  onComplete?: () => void;
  enableSound?: boolean;
  enableVibration?: boolean;
}

export function useRestTimer(options: UseRestTimerOptions = {}): UseRestTimerReturn {
  const {
    onComplete,
    enableSound = true,
    enableVibration = true,
  } = options;

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Calculate progress (0 to 1)
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!enableSound) return;

    try {
      // Create audio context on demand (required for mobile browsers)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Play three beeps
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 800;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.5, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 400);

      setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        osc3.connect(gain3);
        gain3.connect(audioContext.destination);
        osc3.frequency.value = 1000;
        osc3.type = 'sine';
        gain3.gain.setValueAtTime(0.5, audioContext.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc3.start(audioContext.currentTime);
        osc3.stop(audioContext.currentTime + 0.5);
      }, 800);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [enableSound]);

  // Trigger vibration
  const vibrate = useCallback(() => {
    if (!enableVibration) return;

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }, [enableVibration]);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    playNotificationSound();
    vibrate();
    onComplete?.();
  }, [playNotificationSound, vibrate, onComplete]);

  // Start timer
  const start = useCallback((seconds: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTotalTime(seconds);
    setTimeRemaining(seconds);
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleComplete]);

  // Pause timer
  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(true);
  }, [isRunning, isPaused]);

  // Resume timer
  const resume = useCallback(() => {
    if (!isPaused) return;

    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isPaused, handleComplete]);

  // Skip timer
  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeRemaining(0);
    setIsRunning(false);
    setIsPaused(false);
    onComplete?.();
  }, [onComplete]);

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeRemaining(0);
    setTotalTime(0);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    totalTime,
    progress,
    start,
    pause,
    resume,
    skip,
    reset,
  };
}

/**
 * Format seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
