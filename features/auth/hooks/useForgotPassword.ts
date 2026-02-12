import { useState, useCallback, useRef, useEffect } from 'react';
import { AuthService } from '@/shared/services/AuthService';
import { ApiException } from '@/shared/api';

export type ForgotPasswordStep = 0 | 1 | 2;

export function useForgotPassword(initialEmail = '') {
  const [step, setStep] = useState<ForgotPasswordStep>(0);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const resetTokenRef = useRef<string | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0 && !cooldownIntervalRef.current) {
      cooldownIntervalRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
              cooldownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, [resendCooldown]);

  const startCooldown = useCallback(() => {
    setResendCooldown(60);
  }, []);

  const sendCode = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email);
      startCooldown();
      setStep(1);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 429) {
          setError('RATE_LIMITED');
        } else {
          setError(err.message);
        }
      } else {
        setError('NETWORK_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, startCooldown]);

  const resendCode = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email);
      startCooldown();
    } catch (err) {
      if (err instanceof ApiException && err.status === 429) {
        setError('RATE_LIMITED');
      } else {
        setError('NETWORK_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, resendCooldown, startCooldown]);

  const verifyCode = useCallback(async (code: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await AuthService.verifyResetCode(email, code);
      resetTokenRef.current = response.reset_token;
      setAttemptsRemaining(null);
      setStep(2);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.code === 'INVALID_RESET_CODE') {
          // Extract attempts remaining from error message
          const match = err.message.match(/(\d+)\s*attempt/);
          if (match) {
            setAttemptsRemaining(parseInt(match[1], 10));
          }
          setError('INVALID_CODE');
        } else if (err.status === 429) {
          setError('RATE_LIMITED');
        } else {
          setError(err.message);
        }
      } else {
        setError('NETWORK_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const resetPassword = useCallback(async (newPassword: string) => {
    if (!resetTokenRef.current) {
      setError('TOKEN_EXPIRED');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.resetPassword(resetTokenRef.current, newPassword);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.code === 'INVALID_RESET_TOKEN') {
          setError('TOKEN_EXPIRED');
        } else if (err.status === 429) {
          setError('RATE_LIMITED');
        } else {
          setError(err.message);
        }
      } else {
        setError('NETWORK_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToStep = useCallback((newStep: ForgotPasswordStep) => {
    setError(null);
    setStep(newStep);
  }, []);

  const restartFlow = useCallback(() => {
    setError(null);
    setStep(0);
    setIsSuccess(false);
    setAttemptsRemaining(null);
    resetTokenRef.current = null;
  }, []);

  return {
    step,
    goToStep,
    email,
    setEmail,
    sendCode,
    verifyCode,
    resendCode,
    resendCooldown,
    attemptsRemaining,
    resetPassword,
    isLoading,
    error,
    clearError,
    isSuccess,
    restartFlow,
  };
}
