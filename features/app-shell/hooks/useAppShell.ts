/**
 * @file useAppShell.ts
 * @description Logic Controller pour le shell principal de l'application
 */

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseAppShellReturn {
  // Data
  showWelcome: boolean;
  isReady: boolean;

  // Methods
  handleWelcomeFinish: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAppShell(): UseAppShellReturn {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const loadTopics = useStore((state) => state.loadTopics);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadTopics();
      } catch (error) {
        console.error('Failed to load topics:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, [loadTopics]);

  const handleWelcomeFinish = useCallback(() => {
    setShowWelcome(false);
  }, []);

  return {
    showWelcome,
    isReady,
    handleWelcomeFinish,
  };
}
