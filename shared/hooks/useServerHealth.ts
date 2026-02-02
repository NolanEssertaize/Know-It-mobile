/**
 * @file useServerHealth.ts
 * @description Hook to check server health status
 */

import { useState, useEffect, useCallback } from 'react';
import { HEALTH_CHECK_URL } from '@/shared/api/config';

interface ServerHealthState {
  isOnline: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  error: string | null;
}

interface UseServerHealthReturn extends ServerHealthState {
  checkHealth: () => Promise<boolean>;
}

/**
 * Hook to monitor server health
 * 
 * @param autoCheck - Automatically check on mount
 * @param checkInterval - Interval between checks in ms (0 to disable)
 */
export function useServerHealth(
  autoCheck = true,
  checkInterval = 0
): UseServerHealthReturn {
  const [state, setState] = useState<ServerHealthState>({
    isOnline: false,
    isChecking: false,
    lastCheck: null,
    error: null,
  });

  const checkHealth = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(HEALTH_CHECK_URL, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const isOnline = response.ok;
      setState({
        isOnline,
        isChecking: false,
        lastCheck: new Date(),
        error: isOnline ? null : 'Server returned error',
      });

      return isOnline;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Health check failed';
      
      setState({
        isOnline: false,
        isChecking: false,
        lastCheck: new Date(),
        error: errorMessage,
      });

      return false;
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    if (autoCheck) {
      checkHealth();
    }
  }, [autoCheck, checkHealth]);

  // Periodic health checks
  useEffect(() => {
    if (checkInterval > 0) {
      const interval = setInterval(checkHealth, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkInterval, checkHealth]);

  return {
    ...state,
    checkHealth,
  };
}
