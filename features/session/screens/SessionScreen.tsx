/**
 * @file SessionScreen.tsx
 * @description Audio recording session screen
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';
import { useSessionWithAudio } from '../hooks/useSessionWithAudio';

export function SessionScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    status,
    formattedDuration,
    error,
    topic,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleSubmit,
    handleGoBack,
  } = useSessionWithAudio();

  const isRecording = status === 'recording';
  const isPaused = status === 'paused';
  const isAnalyzing = status === 'analyzing';
  const hasRecorded = status === 'idle' && formattedDuration !== '00:00';

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleGoBack}>
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('session.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Topic Info */}
      <GlassView style={styles.topicInfo} padding="md" radius="lg">
        <MaterialIcons name="book" size={20} color={colors.accent.primary} />
        <Text style={[styles.topicTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {topic?.title || t('common.loading')}
        </Text>
      </GlassView>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, { color: colors.text.primary }]}>
            {formattedDuration}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.text.muted }]}>
            {isRecording
              ? t('session.status.recording')
              : isPaused
              ? t('session.status.paused')
              : isAnalyzing
              ? t('session.status.analyzing')
              : hasRecorded
              ? t('session.status.recorded')
              : t('session.status.ready')}
          </Text>
        </View>

        {/* Recording Indicator */}
        <View style={styles.indicatorContainer}>
          {isRecording && (
            <View style={[styles.recordingIndicator, { backgroundColor: colors.status.error }]}>
              <View style={[styles.recordingPulse, { backgroundColor: colors.status.error }]} />
            </View>
          )}
          {isPaused && (
            <View style={[styles.pausedIndicator, { borderColor: colors.status.warning }]}>
              <MaterialIcons name="pause" size={32} color={colors.status.warning} />
            </View>
          )}
          {isAnalyzing && (
            <ActivityIndicator size="large" color={colors.accent.primary} />
          )}
          {!isRecording && !isPaused && !isAnalyzing && (
            <View style={[styles.idleIndicator, { borderColor: colors.glass.border }]}>
              <MaterialIcons
                name="mic"
                size={48}
                color={hasRecorded ? colors.status.success : colors.text.muted}
              />
            </View>
          )}
        </View>

        {/* Instructions */}
        <GlassView style={styles.instructions} padding="lg" radius="lg">
          <Text style={[styles.instructionsTitle, { color: colors.text.primary }]}>
            {t('session.instructions.title')}
          </Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.accent.primary }]}>1</Text>
              <Text style={[styles.instructionText, { color: colors.text.secondary }]}>
                {t('session.instructions.step1')}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.accent.primary }]}>2</Text>
              <Text style={[styles.instructionText, { color: colors.text.secondary }]}>
                {t('session.instructions.step2')}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={[styles.instructionNumber, { color: colors.accent.primary }]}>3</Text>
              <Text style={[styles.instructionText, { color: colors.text.secondary }]}>
                {t('session.instructions.step3')}
              </Text>
            </View>
          </View>
        </GlassView>

        {/* Error Display */}
        {error && (
          <GlassView
            style={[styles.errorContainer, { borderColor: colors.status.error }]}
            padding="md"
            radius="md"
          >
            <MaterialIcons name="error-outline" size={20} color={colors.status.error} />
            <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>
          </GlassView>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {status === 'idle' && !hasRecorded && (
          <GlassButton
            title={t('session.actions.start')}
            onPress={handleStart}
            variant="primary"
            size="lg"
            icon={<MaterialIcons name="mic" size={24} color={colors.text.inverse} />}
            style={styles.mainButton}
          />
        )}

        {isRecording && (
          <View style={styles.recordingControls}>
            <GlassButton
              title={t('session.actions.pause')}
              onPress={handlePause}
              variant="secondary"
              size="lg"
              icon={<MaterialIcons name="pause" size={24} color={colors.text.primary} />}
              style={styles.controlButton}
            />
            <GlassButton
              title={t('session.actions.stop')}
              onPress={handleStop}
              variant="danger"
              size="lg"
              icon={<MaterialIcons name="stop" size={24} color={colors.text.inverse} />}
              style={styles.controlButton}
            />
          </View>
        )}

        {isPaused && (
          <View style={styles.recordingControls}>
            <GlassButton
              title={t('session.actions.resume')}
              onPress={handleResume}
              variant="primary"
              size="lg"
              icon={<MaterialIcons name="mic" size={24} color={colors.text.inverse} />}
              style={styles.controlButton}
            />
            <GlassButton
              title={t('session.actions.stop')}
              onPress={handleStop}
              variant="danger"
              size="lg"
              icon={<MaterialIcons name="stop" size={24} color={colors.text.inverse} />}
              style={styles.controlButton}
            />
          </View>
        )}

        {hasRecorded && (
          <View style={styles.recordingControls}>
            <GlassButton
              title={t('session.actions.rerecord')}
              onPress={handleStart}
              variant="secondary"
              size="lg"
              icon={<MaterialIcons name="refresh" size={24} color={colors.text.primary} />}
              style={styles.controlButton}
            />
            <GlassButton
              title={t('session.actions.submit')}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              icon={<MaterialIcons name="send" size={24} color={colors.text.inverse} />}
              style={styles.controlButton}
            />
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <Text style={[styles.analyzingText, { color: colors.text.muted }]}>
              {t('session.analyzing.message')}
            </Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.heading.h3,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  topicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  topicTitle: {
    flex: 1,
    ...Typography.body.medium,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...Typography.body.medium,
    marginTop: Spacing.xs,
  },
  indicatorContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.5,
  },
  pausedIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    ...Typography.heading.h4,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  instructionsList: {
    gap: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  instructionNumber: {
    ...Typography.body.medium,
    fontWeight: '700',
    width: 24,
  },
  instructionText: {
    flex: 1,
    ...Typography.body.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  errorText: {
    flex: 1,
    ...Typography.body.small,
  },
  controls: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  mainButton: {
    width: '100%',
  },
  recordingControls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  controlButton: {
    flex: 1,
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  analyzingText: {
    ...Typography.body.medium,
  },
});
export default SessionScreen;
