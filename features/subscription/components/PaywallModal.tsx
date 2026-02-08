/**
 * @file PaywallModal.tsx
 * @description Upgrade modal with plan cards + purchase buttons
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { usePaywall } from '../hooks/usePaywall';
import { PlanCard } from './PlanCard';

export const PaywallModal = memo(function PaywallModal() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const paywall = usePaywall();

  return (
    <Modal
      visible={paywall.isVisible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={paywall.hidePaywall}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={paywall.hidePaywall} />

        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background.primary },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.text.muted }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                {t('subscription.paywall.title')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {t('subscription.paywall.subtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={paywall.hidePaywall} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Plan Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {/* Free Plan */}
            <PlanCard
              planType="free"
              sessionsPerDay={1}
              generationsPerDay={1}
              price="$0"
              isCurrent={paywall.planType === 'free'}
            />

            {/* Student Plan */}
            <PlanCard
              planType="student"
              sessionsPerDay={10}
              generationsPerDay={10}
              price={paywall.getProductPrice('com.knowit.student')}
              isCurrent={paywall.planType === 'student'}
              isPopular
              onPurchase={
                paywall.planType !== 'student'
                  ? () => paywall.handlePurchase('com.knowit.student')
                  : undefined
              }
              isPurchasing={paywall.isPurchasing}
            />

            {/* Unlimited Plan */}
            <PlanCard
              planType="unlimited"
              sessionsPerDay={50}
              generationsPerDay={50}
              price={paywall.getProductPrice('com.knowit.unlimited')}
              isCurrent={paywall.planType === 'unlimited'}
              onPurchase={
                paywall.planType !== 'unlimited'
                  ? () => paywall.handlePurchase('com.knowit.unlimited')
                  : undefined
              }
              isPurchasing={paywall.isPurchasing}
            />
          </ScrollView>

          {/* Restore Purchases */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={paywall.handleRestore}
            disabled={paywall.isRestoring}
          >
            {paywall.isRestoring ? (
              <ActivityIndicator size="small" color={colors.text.secondary} />
            ) : (
              <Text style={[styles.restoreText, { color: colors.text.secondary }]}>
                {t('subscription.restore')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Close text */}
          <TouchableOpacity style={styles.notNow} onPress={paywall.hidePaywall}>
            <Text style={[styles.notNowText, { color: colors.text.muted }]}>
              {t('subscription.paywall.close')}
            </Text>
          </TouchableOpacity>

          {/* Loading overlay during purchase */}
          {paywall.isPurchasing && (
            <View style={styles.purchasingOverlay}>
              <ActivityIndicator size="large" color={colors.text.primary} />
              <Text style={[styles.purchasingText, { color: colors.text.primary }]}>
                {t('subscription.purchase.loading')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Spacing.xxl,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notNow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  notNowText: {
    fontSize: 13,
  },
  purchasingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  purchasingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
