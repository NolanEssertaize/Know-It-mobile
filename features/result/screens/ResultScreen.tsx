/**
 * @file features/result/screens/ResultScreen.tsx
 * @description Session result screen displaying score and analysis
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import { useResult } from '../hooks/useResult';
import { ScoreGauge } from '../components/ScoreGauge';
import { AnalysisCard } from '../components/AnalysisCard';

export function ResultScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    session,
    topic,
    analysis,
    score,
    isLoading,
    showTranscription,
    toggleTranscription,
    handleTryAgain,
    handleBackToTopic,
    handleShare,
    handleGoHome,
  } = useResult();

  // Loading state
  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            {t('result.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // No session found
  if (!session || !analysis) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.text.tertiary} />
          <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
            {t('result.notFound')}
          </Text>
          <Text style={[styles.errorMessage, { color: colors.text.secondary }]}>
            {t('result.notFoundMessage')}
          </Text>
          <GlassButton
            title={t('common.goBack')}
            onPress={handleGoHome}
            variant="primary"
            style={styles.errorButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackToTopic}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {topic?.title || t('result.title')}
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Score Section */}
        <GlassView variant="elevated" padding="xl" radius="xl" style={styles.scoreCard}>
          <Text style={[styles.resultLabel, { color: colors.text.secondary }]}>
            {t('result.yourScore')}
          </Text>
          <View style={styles.gaugeContainer}>
            <ScoreGauge score={score} size={200} strokeWidth={14} />
          </View>
        </GlassView>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <GlassView variant="subtle" padding="md" radius="lg" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {analysis.valid?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('result.valid')}
            </Text>
          </GlassView>

          <GlassView variant="subtle" padding="md" radius="lg" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="pencil" size={20} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {analysis.corrections?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('result.corrections')}
            </Text>
          </GlassView>

          <GlassView variant="subtle" padding="md" radius="lg" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="help-circle" size={20} color={colors.error} />
            </View>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {analysis.missing?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('result.missing')}
            </Text>
          </GlassView>
        </View>

        {/* Analysis Section */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          {t('result.detailedAnalysis')}
        </Text>

        {analysis.valid && analysis.valid.length > 0 && (
          <AnalysisCard
            type="valid"
            title={t('result.validPoints')}
            items={analysis.valid}
          />
        )}

        {analysis.corrections && analysis.corrections.length > 0 && (
          <AnalysisCard
            type="corrections"
            title={t('result.correctionsNeeded')}
            items={analysis.corrections}
          />
        )}

        {analysis.missing && analysis.missing.length > 0 && (
          <AnalysisCard
            type="missing"
            title={t('result.missingPoints')}
            items={analysis.missing}
          />
        )}

        {/* Transcription Toggle */}
        {session.transcription && (
          <TouchableOpacity
            onPress={toggleTranscription}
            activeOpacity={0.7}
            style={styles.transcriptionToggle}
          >
            <GlassView variant="subtle" padding="md" radius="lg" style={styles.transcriptionHeader}>
              <View style={styles.transcriptionTitleRow}>
                <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} />
                <Text style={[styles.transcriptionTitle, { color: colors.text.primary }]}>
                  {t('result.transcription')}
                </Text>
              </View>
              <Ionicons
                name={showTranscription ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.secondary}
              />
            </GlassView>
          </TouchableOpacity>
        )}

        {showTranscription && session.transcription && (
          <GlassView variant="default" padding="md" radius="lg" style={styles.transcriptionContent}>
            <Text style={[styles.transcriptionText, { color: colors.text.secondary }]}>
              {session.transcription}
            </Text>
          </GlassView>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <GlassButton
            title={t('result.tryAgain')}
            onPress={handleTryAgain}
            variant="primary"
            size="lg"
            icon={<Ionicons name="refresh" size={20} color="#FFFFFF" />}
            style={styles.primaryAction}
          />
          
          <GlassButton
            title={t('result.backToTopic')}
            onPress={handleBackToTopic}
            variant="secondary"
            size="lg"
            icon={<Ionicons name="arrow-back" size={20} color={colors.text.primary} />}
            style={styles.secondaryAction}
          />
        </View>

        {/* Tips Section */}
        <GlassView variant="subtle" padding="md" radius="lg" style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.warning} />
            <Text style={[styles.tipsTitle, { color: colors.text.primary }]}>
              {t('result.tips.title')}
            </Text>
          </View>
          <Text style={[styles.tipsText, { color: colors.text.secondary }]}>
            {score >= 80
              ? t('result.tips.excellent')
              : score >= 60
              ? t('result.tips.good')
              : t('result.tips.needsWork')}
          </Text>
        </GlassView>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body.medium,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    ...Typography.heading.h2,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  errorMessage: {
    ...Typography.body.medium,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: Spacing.lg,
    minWidth: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...Typography.heading.h3,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultLabel: {
    ...Typography.body.medium,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.heading.h3,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.body.small,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.heading.h3,
    marginBottom: Spacing.md,
  },
  transcriptionToggle: {
    marginTop: Spacing.sm,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  transcriptionTitle: {
    ...Typography.body.medium,
    fontWeight: '600',
  },
  transcriptionContent: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  transcriptionText: {
    ...Typography.body.medium,
    lineHeight: 22,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
  tipsCard: {
    marginTop: Spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    ...Typography.body.medium,
    fontWeight: '600',
  },
  tipsText: {
    ...Typography.body.medium,
    lineHeight: 22,
  },
});

export default ResultScreen;
