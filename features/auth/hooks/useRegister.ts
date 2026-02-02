/**
 * @file useRegister.ts
 * @description Hook for registration functionality
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';

interface UseRegisterReturn {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  validationError: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleRegister: () => Promise<void>;
  clearError: () => void;
  navigateToLogin: () => void;
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    setValidationError(null);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError(t('auth.register.invalidEmail'));
      return false;
    }

    // Password strength
    if (password.length < 8) {
      setValidationError(t('auth.register.weakPassword'));
      return false;
    }

    // Password match
    if (password !== confirmPassword) {
      setValidationError(t('auth.register.passwordMismatch'));
      return false;
    }

    return true;
  }, [email, password, confirmPassword, t]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register(email.trim(), password);
      // Navigation will be handled by the auth layout
    } catch (err) {
      console.error('[useRegister] Registration failed:', err);
    }
  }, [email, password, validateForm, register]);

  const navigateToLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  const handleClearError = useCallback(() => {
    clearError();
    setValidationError(null);
  }, [clearError]);

  return {
    email,
    password,
    confirmPassword,
    isLoading,
    error: error || validationError,
    validationError,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister,
    clearError: handleClearError,
    navigateToLogin,
  };
}
