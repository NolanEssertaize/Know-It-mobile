/**
 * @file useServerHealth.ts
 * @description Hook for checking server health/connectivity status
 *
 * This hook periodically checks if the backend server is reachable
 * and provides connection status to the app.
 *
 * Usage:
 * const { isConnected, isChecking, error, attempt } = useServerHealth();
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Your API base URL - update this to match your backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const HEALTH_ENDPOINT = '/health'; // Common health check endpoint
const CHECK_INTERVAL = 30000; // 30 seconds between checks when connected
const RETRY_INTERVAL = 3000; // 3 seconds between retries when disconnected
const MAX_RETRIES = 10; // Maximum retry attempts before giving up
const TIMEOUT_MS = 5000; // Request timeout

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseServerHealthReturn {
    /** Whether the server is currently reachable */
    isConnected: boolean;
    /** Whether a health check is currently in progress */
    isChecking: boolean;
    /** Error message if connection failed */
    error: string | null;
    /** Current retry attempt number */
    attempt: number;
    /** Manually trigger a health check */
    checkHealth: () => Promise<boolean>;
    /** Reset the connection state and retry */
    retry: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useServerHealth(): UseServerHealthReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(1);

    const isMounted = useRef(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // HEALTH CHECK FUNCTION
    // ─────────────────────────────────────────────────────────────────────────

    const checkHealth = useCallback(async (): Promise<boolean> => {
        if (!isMounted.current) return false;

        setIsChecking(true);
        setError(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            const response = await fetch(`${API_BASE_URL}${HEALTH_ENDPOINT}`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (!isMounted.current) return false;

            if (response.ok) {
                setIsConnected(true);
                setIsChecking(false);
                setError(null);
                setAttempt(1);
                return true;
            } else {
                throw new Error(`Server responded with status ${response.status}`);
            }
        } catch (err) {
            if (!isMounted.current) return false;

            const errorMessage = err instanceof Error ? err.message : 'Connection failed';

            // Handle specific error types
            if (err instanceof Error && err.name === 'AbortError') {
                setError('Connection timeout');
            } else if (errorMessage.includes('Network request failed')) {
                setError('Network unavailable');
            } else {
                setError(errorMessage);
            }

            setIsConnected(false);
            setIsChecking(false);
            return false;
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETRY LOGIC
    // ─────────────────────────────────────────────────────────────────────────

    const scheduleRetry = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }

        if (attempt < MAX_RETRIES) {
            retryTimeoutRef.current = setTimeout(async () => {
                if (!isMounted.current) return;

                setAttempt((prev) => prev + 1);
                const success = await checkHealth();

                if (!success && isMounted.current) {
                    scheduleRetry();
                }
            }, RETRY_INTERVAL);
        }
    }, [attempt, checkHealth]);

    // ─────────────────────────────────────────────────────────────────────────
    // MANUAL RETRY
    // ─────────────────────────────────────────────────────────────────────────

    const retry = useCallback(() => {
        setAttempt(1);
        setError(null);
        checkHealth().then((success) => {
            if (!success && isMounted.current) {
                scheduleRetry();
            }
        });
    }, [checkHealth, scheduleRetry]);

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    // Initial check on mount
    useEffect(() => {
        isMounted.current = true;

        const initialCheck = async () => {
            const success = await checkHealth();
            if (!success && isMounted.current) {
                scheduleRetry();
            }
        };

        initialCheck();

        return () => {
            isMounted.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [checkHealth, scheduleRetry]);

    // Periodic health check when connected
    useEffect(() => {
        if (isConnected) {
            // Clear any retry timeouts
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }

            // Set up periodic checks
            intervalRef.current = setInterval(() => {
                checkHealth().then((success) => {
                    if (!success && isMounted.current) {
                        scheduleRetry();
                    }
                });
            }, CHECK_INTERVAL);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isConnected, checkHealth, scheduleRetry]);

    return {
        isConnected,
        isChecking,
        error,
        attempt,
        checkHealth,
        retry,
    };
}

export default useServerHealth;