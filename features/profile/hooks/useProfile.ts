/**
 * @file features/profile/hooks/useProfile.ts
 * @description Hook for managing user profile, preferences, and statistics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import { useLanguage } from '@/i18n';
import type { ThemeMode } from '@/types';

interface UserStats {
  totalTopics: number;
  totalSessions: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  totalStudyTime: number; // in minutes
}

interface ProfilePreferences {
  themeMode: ThemeMode;
  language: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export function useProfile() {
  const { t } = useTranslation();
  const { user, logout, isLoading: authLoading } = useAuthStore();
  const { topics } = useStore();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState<ProfilePreferences>({
    themeMode: themeMode,
    language: currentLanguage,
    notificationsEnabled: true,
    soundEnabled: true,
    hapticEnabled: true,
  });

  // Calculate user statistics
  const [stats, setStats] = useState<UserStats>({
    totalTopics: 0,
    totalSessions: 0,
    averageScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalStudyTime: 0,
  });

  // Calculate stats from topics - only once
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const calculateStats = () => {
      let totalSessions = 0;
      let totalScore = 0;
      let scoredSessions = 0;
      let totalTime = 0;

      topics.forEach((topic) => {
        totalSessions += topic.sessionCount;
        topic.sessions?.forEach((session) => {
          if (session.analysis?.score !== undefined) {
            totalScore += session.analysis.score;
            scoredSessions++;
          }
          // Estimate ~5 minutes per session
          totalTime += 5;
        });
      });

      // Simple streak calculation based on consecutive days
      // In production, this would use actual session dates
      const currentStreak = Math.min(totalSessions, 7); // Cap at 7 for demo
      const bestStreak = Math.max(currentStreak, 10); // Demo value

      setStats({
        totalTopics: topics.length,
        totalSessions,
        averageScore: scoredSessions > 0 ? Math.round(totalScore / scoredSessions) : 0,
        currentStreak,
        bestStreak,
        totalStudyTime: totalTime,
      });
    };

    calculateStats();
  }, [topics]);

  // Sync preferences with actual values
  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      themeMode,
      language: currentLanguage,
    }));
  }, [themeMode, currentLanguage]);

  /**
   * Update a single preference
   */
  const updatePreference = useCallback(
    <K extends keyof ProfilePreferences>(key: K, value: ProfilePreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));

      // Apply changes immediately for theme and language
      if (key === 'themeMode') {
        setThemeMode(value as ThemeMode);
      } else if (key === 'language') {
        changeLanguage(value as string);
      }
    },
    [setThemeMode, changeLanguage]
  );

  /**
   * Save all preferences
   */
  const handleSavePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      // In production, this would sync to backend
      // For now, theme and language are already persisted via their respective stores
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      
      Alert.alert(t('common.success'), t('profile.preferencesSaved'));
    } catch (error) {
      Alert.alert(t('errors.generic'), t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert(t('errors.generic'), t('errors.logoutFailed'));
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [logout, t]);

  /**
   * Handle account deletion request
   */
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('profile.deleteAccountTitle'),
      t('profile.deleteAccountMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            // In production, this would call the API to delete the account
            Alert.alert(
              t('profile.deleteAccountRequestedTitle'),
              t('profile.deleteAccountRequestedMessage')
            );
          },
        },
      ]
    );
  }, [t]);

  /**
   * Navigate to edit profile
   */
  const handleEditProfile = useCallback(() => {
    // In production, this would navigate to an edit profile screen
    Alert.alert(t('common.comingSoon'), t('profile.editProfileComingSoon'));
  }, [t]);

  /**
   * Format study time for display
   */
  const formatStudyTime = useCallback(
    (minutes: number): string => {
      if (minutes < 60) {
        return t('profile.minutesStudied', { count: minutes });
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return t('profile.hoursStudied', { count: hours });
      }
      return t('profile.hoursMinutesStudied', { hours, minutes: remainingMinutes });
    },
    [t]
  );

  return {
    // User data
    user,
    stats,
    
    // Preferences
    preferences,
    updatePreference,
    handleSavePreferences,
    
    // Language options
    availableLanguages,
    
    // Actions
    handleLogout,
    handleDeleteAccount,
    handleEditProfile,
    
    // Utilities
    formatStudyTime,
    
    // Loading states
    isLoading: isLoading || authLoading,
    isSaving,
  };
}

export type { UserStats, ProfilePreferences };
