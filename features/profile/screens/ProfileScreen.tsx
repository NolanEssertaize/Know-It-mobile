/**
 * @file features/profile/screens/ProfileScreen.tsx
 * @description User profile screen with stats, preferences, and account management
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme } from '@/theme';
import { useProfile } from '../hooks/useProfile';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import type { ThemeMode } from '@/types';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    user,
    stats,
    preferences,
    updatePreference,
    availableLanguages,
    handleLogout,
    handleDeleteAccount,
    handleEditProfile,
    formatStudyTime,
    isLoading,
  } = useProfile();

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: t('profile.themeLight'), icon: 'sunny-outline' },
    { value: 'dark', label: t('profile.themeDark'), icon: 'moon-outline' },
    { value: 'system', label: t('profile.themeSystem'), icon: 'phone-portrait-outline' },
  ];

  return (
    <ScreenWrapper scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('profile.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* User Info Card */}
        <GlassView variant="elevated" padding="lg" radius="xl" style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: colors.surface }]}
              onPress={handleEditProfile}
            >
              <Ionicons name="camera" size={14} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {user?.name || t('profile.defaultName')}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text.secondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
          
          <TouchableOpacity
            style={[styles.editProfileButton, { borderColor: colors.border }]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.editProfileText, { color: colors.primary }]}>
              {t('profile.editProfile')}
            </Text>
          </TouchableOpacity>
        </GlassView>

        {/* Stats Grid */}
        <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
          {t('profile.statistics')}
        </Text>
        <View style={styles.statsGrid}>
          <GlassView variant="default" padding="md" radius="lg" style={styles.statCard}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.totalTopics}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('profile.topics')}
            </Text>
          </GlassView>
          
          <GlassView variant="default" padding="md" radius="lg" style={styles.statCard}>
            <Ionicons name="school-outline" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.totalSessions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('profile.sessions')}
            </Text>
          </GlassView>
          
          <GlassView variant="default" padding="md" radius="lg" style={styles.statCard}>
            <Ionicons name="trophy-outline" size={24} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.averageScore}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('profile.avgScore')}
            </Text>
          </GlassView>
          
          <GlassView variant="default" padding="md" radius="lg" style={styles.statCard}>
            <Ionicons name="flame-outline" size={24} color={colors.error} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('profile.streak')}
            </Text>
          </GlassView>
        </View>

        {/* Study Time */}
        <GlassView variant="subtle" padding="md" radius="lg" style={styles.studyTimeCard}>
          <View style={styles.studyTimeContent}>
            <Ionicons name="time-outline" size={28} color={colors.primary} />
            <View style={styles.studyTimeText}>
              <Text style={[styles.studyTimeValue, { color: colors.text.primary }]}>
                {formatStudyTime(stats.totalStudyTime)}
              </Text>
              <Text style={[styles.studyTimeLabel, { color: colors.text.secondary }]}>
                {t('profile.totalStudyTime')}
              </Text>
            </View>
          </View>
        </GlassView>

        {/* Language Settings */}
        <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
          {t('profile.preferences')}
        </Text>
        
        <LanguageSwitcher
          currentLanguage={preferences.language}
          availableLanguages={availableLanguages}
          onLanguageChange={(code) => updatePreference('language', code)}
        />

        {/* Theme Settings */}
        <Text style={[styles.subsectionLabel, { color: colors.text.secondary }]}>
          {t('profile.theme')}
        </Text>
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => updatePreference('themeMode', option.value)}
              style={styles.themeOptionWrapper}
            >
              <GlassView
                variant={preferences.themeMode === option.value ? 'elevated' : 'subtle'}
                padding="md"
                radius="lg"
                style={[
                  styles.themeOption,
                  preferences.themeMode === option.value && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    preferences.themeMode === option.value
                      ? colors.primary
                      : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    {
                      color:
                        preferences.themeMode === option.value
                          ? colors.primary
                          : colors.text.primary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </GlassView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Preferences */}
        <GlassView variant="default" padding="none" radius="lg" style={styles.preferencesCard}>
          <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
              <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                {t('profile.notifications')}
              </Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={(value) => updatePreference('notificationsEnabled', value)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={preferences.notificationsEnabled ? colors.primary : colors.surface}
            />
          </View>
          
          <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="volume-high-outline" size={22} color={colors.text.primary} />
              <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                {t('profile.sounds')}
              </Text>
            </View>
            <Switch
              value={preferences.soundEnabled}
              onValueChange={(value) => updatePreference('soundEnabled', value)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={preferences.soundEnabled ? colors.primary : colors.surface}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="phone-portrait-outline" size={22} color={colors.text.primary} />
              <Text style={[styles.preferenceLabel, { color: colors.text.primary }]}>
                {t('profile.haptics')}
              </Text>
            </View>
            <Switch
              value={preferences.hapticEnabled}
              onValueChange={(value) => updatePreference('hapticEnabled', value)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={preferences.hapticEnabled ? colors.primary : colors.surface}
            />
          </View>
        </GlassView>

        {/* Account Actions */}
        <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
          {t('profile.account')}
        </Text>
        
        <View style={styles.accountActions}>
          <GlassButton
            title={t('profile.logout')}
            onPress={handleLogout}
            variant="secondary"
            icon={<Ionicons name="log-out-outline" size={20} color={colors.text.primary} />}
            loading={isLoading}
            style={styles.logoutButton}
          />
          
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={styles.deleteAccountButton}
          >
            <Text style={[styles.deleteAccountText, { color: colors.error }]}>
              {t('profile.deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.appVersion, { color: colors.text.tertiary }]}>
          KnowIt v1.0.0
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  subsectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  studyTimeCard: {
    marginBottom: 24,
  },
  studyTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  studyTimeText: {
    flex: 1,
  },
  studyTimeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  studyTimeLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  themeOptionWrapper: {
    flex: 1,
  },
  themeOption: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  themeOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  preferencesCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  accountActions: {
    gap: 16,
    marginBottom: 24,
  },
  logoutButton: {
    width: '100%',
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
});

export default ProfileScreen;
