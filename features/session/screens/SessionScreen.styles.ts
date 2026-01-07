/**
 * @file SessionScreen.styles.ts
 * @description Styles pour l'écran d'enregistrement
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GlassColors.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: GlassColors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  topicBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  topicTitle: {
    color: GlassColors.accent.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  statusText: {
    color: GlassColors.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statusHint: {
    color: GlassColors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  recordButtonContainer: {
    marginBottom: Spacing.xxl,
  },
  analyzingContainer: {
    alignItems: 'center',
  },
  analyzingText: {
    color: GlassColors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.lg,
  },
  analyzingHint: {
    color: GlassColors.text.secondary,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  errorText: {
    color: GlassColors.text.secondary,
    fontSize: 16,
  },
});
