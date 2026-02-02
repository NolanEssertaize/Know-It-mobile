/**
 * @file useLogin.ts
 * @description Hook for login functionality
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';

interface UseLoginReturn {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleLogin: () => Promise<void>;
  clearError: () => void;
  navigateToRegister: () => void;
}

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const { t } = useTranslation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigation will be handled by the auth layout
    } catch (err) {
      console.error('[useLogin] Login failed:', err);
    }
  }, [email, password, login]);

  const navigateToRegister = useCallback(() => {
    router.push('/auth/register');
  }, [router]);

  return {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleLogin,
    clearError,
    navigateToRegister,
  };
}
