/**
 * @file ProfileScreen.tsx
 * @description Écran de profil - Bottom Sheet Modal Style - Theme Aware
 *
 * FIXED:
 * - Added ThemeSelector component (Light/Dark/System)
 * - All colors now use useTheme() hook
 * - Removed hardcoded colors
 * - StatusBar adapts to theme
 */

import React, { memo, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Platform,
    StyleSheet,
    Animated,
    Dimensions,
    Pressable,
    StatusBar,
    Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { Spacing, BorderRadius, useTheme, ThemeSelector } from '@/theme';

import { useProfile, type ProfileTab } from '../hooks/useProfile';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { LogoutConfirmationModal } from '../components/LogoutConfirmationModal';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useSubscription, PlanBadge, UsageProgressBar } from '@/features/subscription';
import { IAPService } from '@/shared/services';
import { useSubscriptionStore, useNotificationStore } from '@/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════
// TAB BUTTON COMPONENT - THEME AWARE
// ═══════════════════════════════════════════════════════════════════════════

interface TabButtonProps {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isActive: boolean;
    onPress: () => void;
}

const TabButton = memo(function TabButton({ label, icon, isActive, onPress }: TabButtonProps) {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.tab,
                isActive && {
                    backgroundColor: colors.text.primary,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {isActive ? (
                <Text
                    style={[
                        styles.tabText,
                        { color: colors.text.inverse },
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            ) : (
                <MaterialIcons
                    name={icon}
                    size={22}
                    color={colors.text.muted}
                />
            )}
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// PRIMARY BUTTON COMPONENT - THEME AWARE
// ═══════════════════════════════════════════════════════════════════════════

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

const PrimaryButton = memo(function PrimaryButton({
    title,
    onPress,
    disabled = false,
    loading = false,
}: PrimaryButtonProps) {
    const { colors } = useTheme();
    
    return (
        <TouchableOpacity
            style={[
                styles.primaryButton,
                { backgroundColor: colors.text.primary },
                disabled && { opacity: 0.5 },
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
                <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION TOGGLES COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const NotificationToggles = memo(function NotificationToggles({ colors }: { colors: any }) {
    const { t } = useTranslation();
    const eveningEnabled = useNotificationStore((s) => s.eveningReminderEnabled);
    const flashcardEnabled = useNotificationStore((s) => s.flashcardReminderEnabled);
    const toggleEvening = useNotificationStore((s) => s.toggleEveningReminder);
    const toggleFlashcard = useNotificationStore((s) => s.toggleFlashcardReminder);

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                {t('profile.sections.notifications')}
            </Text>
            <GlassView variant="default" style={styles.sectionCard}>
                <View style={styles.switchItem}>
                    <View style={styles.switchLabel}>
                        <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                            {t('notifications.settings.eveningReminder')}
                        </Text>
                        <Text style={[styles.switchDescription, { color: colors.text.secondary }]}>
                            {t('notifications.settings.eveningReminderDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={eveningEnabled}
                        onValueChange={toggleEvening}
                        trackColor={{
                            false: colors.surface.glass,
                            true: colors.text.primary,
                        }}
                        thumbColor={
                            eveningEnabled
                                ? colors.background.primary
                                : colors.text.primary
                        }
                        ios_backgroundColor={colors.surface.glass}
                    />
                </View>

                <View style={[styles.switchItem, styles.listItemLast]}>
                    <View style={styles.switchLabel}>
                        <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                            {t('notifications.settings.flashcardReminder')}
                        </Text>
                        <Text style={[styles.switchDescription, { color: colors.text.secondary }]}>
                            {t('notifications.settings.flashcardReminderDesc')}
                        </Text>
                    </View>
                    <Switch
                        value={flashcardEnabled}
                        onValueChange={toggleFlashcard}
                        trackColor={{
                            false: colors.surface.glass,
                            true: colors.text.primary,
                        }}
                        thumbColor={
                            flashcardEnabled
                                ? colors.background.primary
                                : colors.text.primary
                        }
                        ios_backgroundColor={colors.surface.glass}
                    />
                </View>
            </GlassView>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ProfileScreenComponent() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { tab, showPaywall: showPaywallParam } = useLocalSearchParams<{ tab?: string; showPaywall?: string }>();
    const logic = useProfile(tab as ProfileTab | undefined);
    const { t, i18n } = useTranslation();

    // Get theme
    const { colors, isDark } = useTheme();

    // Subscription hooks - MUST be before any early return to satisfy Rules of Hooks
    const sub = useSubscription();
    const showPaywall = useSubscriptionStore((s) => s.showPaywall);

    // Auto-show paywall when navigated with showPaywall param
    useEffect(() => {
        if (showPaywallParam === 'true') {
            // Small delay to let the profile screen render first
            const timer = setTimeout(() => showPaywall(), 400);
            return () => clearTimeout(timer);
        }
    }, [showPaywallParam, showPaywall]);

    const handleManageSubscription = useCallback(() => {
        const url = Platform.OS === 'ios'
            ? 'https://apps.apple.com/account/subscriptions'
            : 'https://play.google.com/store/account/subscriptions';
        Linking.openURL(url);
    }, []);

    const handleRestorePurchases = useCallback(async () => {
        try {
            const purchases = await IAPService.restorePurchases();
            if (purchases.length === 0) {
                Alert.alert(t('common.ok'), t('subscription.purchase.nothingToRestore'));
                return;
            }
            const latest = purchases[purchases.length - 1];
            const receiptData = latest.purchaseToken ?? '';
            if (receiptData) {
                const success = await useSubscriptionStore.getState().verifyPurchase(
                    Platform.OS as 'ios' | 'android',
                    receiptData,
                    latest.productId,
                );
                if (success) {
                    await IAPService.finishPurchase(latest);
                    Alert.alert(t('common.success'), t('subscription.purchase.restored'));
                } else {
                    Alert.alert(t('common.error'), t('subscription.purchase.verifyFailed'));
                }
            }
        } catch {
            Alert.alert(t('common.error'), t('subscription.purchase.failed'));
        }
    }, [t]);

    // Animation
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleClose = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    }, [slideAnim, router]);

    const handleExportData = useCallback(() => {
        Alert.alert(
            t('profile.alerts.exportTitle'),
            t('profile.alerts.exportMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.actions.exportData'),
                    onPress: async () => {
                        await logic.handleExportData();
                        Alert.alert(t('common.success'), t('profile.alerts.exportSuccess'));
                    },
                },
            ]
        );
    }, [logic, t]);

    const handleLogoutConfirm = useCallback(async () => {
        try {
            const result = await logic.handleLogout();
            if (!result.success && result.error) {
                Alert.alert(t('common.error'), result.error);
            }
            // On success: AuthNavigator in _layout.tsx redirects to login
            // automatically when isAuthenticated flips to false
        } catch (error) {
            Alert.alert(t('common.error'), t('errors.logoutFailed'));
        }
    }, [logic, t]);

    const handleDeleteConfirm = useCallback(
        async (password: string) => {
            const result = await logic.handleDeleteAccount(password);
            if (result.success) {
                router.replace('/(auth)/login');
            } else if (result.error) {
                Alert.alert(t('common.error'), result.error);
            }
        },
        [logic, router, t]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.user) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER PROFILE TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderProfileTab = () => (
        <>
            {/* Personal Information */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.personalInfo')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    {/* Email */}
                    <View style={styles.listItem}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="email" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.fields.email')}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {logic.user?.email}
                            </Text>
                        </View>
                    </View>

                    {/* Full Name */}
                    <View style={[styles.listItem, styles.listItemLast]}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="person" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.fields.fullName')}
                            </Text>
                            <TextInput
                                style={[styles.listItemInput, { color: colors.text.primary }]}
                                value={logic.fullName}
                                onChangeText={logic.setFullName}
                                placeholder={t('profile.placeholders.enterName')}
                                placeholderTextColor={colors.text.muted}
                            />
                        </View>
                    </View>
                </GlassView>

                {/* Save Button */}
                <PrimaryButton
                    title={t('profile.buttons.saveChanges')}
                    onPress={logic.handleUpdateProfile}
                    disabled={logic.fullName === logic.user?.fullName}
                    loading={logic.isLoading}
                />
            </View>

            {/* Security */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.security')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity
                        style={[styles.listItem, styles.listItemLast]}
                        onPress={logic.showPasswordModal}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="lock" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.fields.password')}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {t('profile.actions.changePassword')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* RGPD Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.gdpr')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={handleExportData}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="download" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.exportData')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.listItem, styles.listItemLast]}
                        onPress={logic.showDeleteModal}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="delete-forever" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.deleteAccount')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>
                </GlassView>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER PREFERENCES TAB - WITH THEME SELECTOR
    // ─────────────────────────────────────────────────────────────────────────

    const renderPreferencesTab = () => (
        <>
            {/* Notifications */}
            <NotificationToggles colors={colors} />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* THEME SELECTOR - NEW SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.appearance')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.themeSection}>
                        <View style={styles.themeSectionHeader}>
                            <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                                {t('profile.preferences.theme')}
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.text.secondary }]}>
                                {t('profile.preferences.themeDescription')}
                            </Text>
                        </View>
                        <View style={styles.themeSelectorContainer}>
                            <ThemeSelector language={i18n.language} />
                        </View>
                    </View>
                </GlassView>
            </View>

            {/* Language */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.language')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={[styles.switchItem, styles.listItemLast]}>
                        <LanguageSwitcher showIcon={false} />
                    </View>
                </GlassView>
            </View>

            {/* Data & Storage */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.dataStorage')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.switchItem}>
                        <View style={styles.switchLabel}>
                            <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                                {t('profile.preferences.autoSave')}
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.text.secondary }]}>
                                {t('profile.preferences.autoSaveDescription')}
                            </Text>
                        </View>
                        <Switch
                            value={logic.preferences.autoSave}
                            onValueChange={logic.toggleAutoSave}
                            trackColor={{
                                false: colors.surface.glass,
                                true: colors.text.primary,
                            }}
                            thumbColor={
                                logic.preferences.autoSave
                                    ? colors.background.primary
                                    : colors.text.primary
                            }
                            ios_backgroundColor={colors.surface.glass}
                        />
                    </View>

                    <View style={[styles.switchItem, styles.listItemLast]}>
                        <View style={styles.switchLabel}>
                            <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                                {t('profile.preferences.analytics')}
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.text.secondary }]}>
                                {t('profile.preferences.analyticsDescription')}
                            </Text>
                        </View>
                        <Switch
                            value={logic.preferences.analyticsEnabled}
                            onValueChange={logic.toggleAnalytics}
                            trackColor={{
                                false: colors.surface.glass,
                                true: colors.text.primary,
                            }}
                            thumbColor={
                                logic.preferences.analyticsEnabled
                                    ? colors.background.primary
                                    : colors.text.primary
                            }
                            ios_backgroundColor={colors.surface.glass}
                        />
                    </View>
                </GlassView>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER SUBSCRIPTION TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderSubscriptionTab = () => (
        <>
            {/* Plan Badge */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('subscription.currentPlan')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={[styles.listItem, styles.listItemLast]}>
                        <PlanBadge planType={sub.planType} />
                    </View>
                </GlassView>
            </View>

            {/* Expired Banner */}
            {sub.isExpired && (
                <View style={styles.section}>
                    <GlassView variant="default" style={[styles.sectionCard, { borderColor: '#FF3B30', borderWidth: 1 }]}>
                        <View style={[styles.listItem, styles.listItemLast]}>
                            <View style={[styles.listItemIcon, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}>
                                <MaterialIcons name="warning" size={20} color="#FF3B30" />
                            </View>
                            <View style={styles.listItemContent}>
                                <Text style={[styles.listItemValue, { color: '#FF3B30' }]}>
                                    {t('subscription.expired')}
                                </Text>
                                <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                    {t('subscription.expiredBanner')}
                                </Text>
                            </View>
                        </View>
                    </GlassView>
                </View>
            )}

            {/* Usage Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('subscription.usage.sessions')} & {t('subscription.usage.generations')}
                </Text>
                <GlassView variant="default" style={[styles.sectionCard, { padding: Spacing.md }]}>
                    <UsageProgressBar
                        label={t('subscription.usage.sessions')}
                        used={sub.sessionsUsed}
                        limit={sub.sessionsLimit}
                        color={sub.sessionsColor}
                        progress={sub.sessionsProgress}
                    />
                    <UsageProgressBar
                        label={t('subscription.usage.generations')}
                        used={sub.generationsUsed}
                        limit={sub.generationsLimit}
                        color={sub.generationsColor}
                        progress={sub.generationsProgress}
                    />
                </GlassView>
            </View>

            {/* Expiration */}
            {sub.isPaid && sub.expiresAt && !sub.isExpired && (
                <View style={styles.section}>
                    <GlassView variant="default" style={styles.sectionCard}>
                        <View style={[styles.listItem, styles.listItemLast]}>
                            <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                                <MaterialIcons name="event" size={20} color={colors.text.primary} />
                            </View>
                            <View style={styles.listItemContent}>
                                <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                    {t('subscription.expires', { date: new Date(sub.expiresAt).toLocaleDateString() })}
                                </Text>
                            </View>
                        </View>
                    </GlassView>
                </View>
            )}

            {/* Buttons */}
            <View style={styles.section}>
                {sub.canUpgrade && (
                    <PrimaryButton
                        title={t('subscription.upgrade')}
                        onPress={showPaywall}
                    />
                )}

                <TouchableOpacity
                    style={[
                        styles.logoutButton,
                        {
                            backgroundColor: colors.surface.glass,
                            borderColor: colors.glass.border,
                            marginTop: Spacing.sm,
                        },
                    ]}
                    onPress={handleRestorePurchases}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="restore" size={20} color={colors.text.primary} />
                    <Text style={[styles.logoutText, { color: colors.text.primary }]}>
                        {t('subscription.restore')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ alignItems: 'center', marginTop: Spacing.md }}
                    onPress={handleManageSubscription}
                >
                    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                        {t('subscription.manage')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER ABOUT TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderAboutTab = () => (
        <>
            {/* App Info */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.app')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.listItem}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="info" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.fields.version')}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                1.0.0 (Build 1)
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="star" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.rateApp')}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {t('profile.actions.leaveReview')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="share" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.shareApp')}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {t('profile.actions.inviteFriends')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Legal */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.legal')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/legal-mentions')}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="gavel" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('legal.mentionsLegales')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/terms-of-service')}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="description" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.termsOfService')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/privacy-policy')}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="privacy-tip" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.privacyPolicy')}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7} onPress={() => Linking.openURL('mailto:knowit-support@essertaize.com')}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="email" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.actions.contactUs')}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                knowit-support@essertaize.com
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Copyright */}
            <View style={styles.copyright}>
                <Text style={[styles.copyrightText, { color: colors.text.muted }]}>
                    {t('profile.footer.copyright')}
                </Text>
                <Text style={[styles.copyrightText, { color: colors.text.muted }]}>
                    {t('profile.footer.allRightsReserved')}
                </Text>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={handleClose} />

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    { 
                        backgroundColor: colors.background.primary,
                        paddingBottom: insets.bottom,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Handle */}
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: colors.text.muted }]} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        {t('profile.header.title')}
                    </Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <MaterialIcons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={[styles.tabsContainer, { backgroundColor: colors.surface.glass }]}>
                    <TabButton
                        label={t('profile.tabs.profile')}
                        icon="person"
                        isActive={logic.activeTab === 'profile'}
                        onPress={() => logic.setActiveTab('profile')}
                    />
                    <TabButton
                        label={t('profile.tabs.preferences')}
                        icon="tune"
                        isActive={logic.activeTab === 'preferences'}
                        onPress={() => logic.setActiveTab('preferences')}
                    />
                    <TabButton
                        label={t('subscription.tab')}
                        icon="credit-card"
                        isActive={logic.activeTab === 'subscription'}
                        onPress={() => logic.setActiveTab('subscription')}
                    />
                    <TabButton
                        label={t('profile.tabs.about')}
                        icon="info"
                        isActive={logic.activeTab === 'about'}
                        onPress={() => logic.setActiveTab('about')}
                    />
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {logic.activeTab === 'profile' && renderProfileTab()}
                    {logic.activeTab === 'preferences' && renderPreferencesTab()}
                    {logic.activeTab === 'subscription' && renderSubscriptionTab()}
                    {logic.activeTab === 'about' && renderAboutTab()}

                    {/* Logout Button */}
                    <View style={styles.logoutSection}>
                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                {
                                    backgroundColor: colors.surface.glass,
                                    borderColor: colors.glass.border,
                                },
                            ]}
                            onPress={logic.showLogoutModal}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="logout" size={20} color={colors.text.primary} />
                            <Text style={[styles.logoutText, { color: colors.text.primary }]}>
                                {t('profile.buttons.logout')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Modals */}
            <PasswordChangeModal
                visible={logic.isPasswordModalVisible}
                onClose={logic.hidePasswordModal}
                onSubmit={logic.handleChangePassword}
                passwordData={logic.passwordData}
                onCurrentPasswordChange={logic.setCurrentPassword}
                onNewPasswordChange={logic.setNewPassword}
                onConfirmPasswordChange={logic.setConfirmPassword}
                errors={logic.passwordErrors}
                isLoading={logic.isLoading}
            />

            <DeleteAccountModal
                visible={logic.isDeleteModalVisible}
                onClose={logic.hideDeleteModal}
                onConfirm={handleDeleteConfirm}
                isLoading={logic.isLoading}
            />

            <LogoutConfirmationModal
                visible={logic.isLogoutModalVisible}
                onClose={logic.hideLogoutModal}
                onConfirm={handleLogoutConfirm}
                isLoading={logic.isLoading}
            />
        </View>
    );
}

export const ProfileScreen = memo(ProfileScreenComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline with useTheme)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: SCREEN_HEIGHT * 0.9,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: 4,
        marginBottom: Spacing.md,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: 16,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    sectionCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    listItemLast: {
        borderBottomWidth: 0,
    },
    listItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    listItemContent: {
        flex: 1,
    },
    listItemLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    listItemValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    listItemInput: {
        fontSize: 16,
        fontWeight: '500',
        padding: 0,
    },
    primaryButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    switchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    switchLabel: {
        flex: 1,
        marginRight: Spacing.md,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: 13,
    },
    themeSection: {
        padding: Spacing.md,
    },
    themeSectionHeader: {
        marginBottom: Spacing.md,
    },
    themeSelectorContainer: {
        marginTop: Spacing.sm,
    },
    languageSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    languageOption: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    languageText: {
        fontSize: 14,
        fontWeight: '500',
    },
    copyright: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    copyrightText: {
        fontSize: 12,
    },
    logoutSection: {
        marginTop: Spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ProfileScreen;
