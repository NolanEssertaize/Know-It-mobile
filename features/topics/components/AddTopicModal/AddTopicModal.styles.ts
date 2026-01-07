/**
 * @file AddTopicModal.styles.ts
 * @description Styles pour le modal d'ajout de topic
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: GlassColors.gradient.middle,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: GlassColors.text.primary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  input: {
    fontSize: 16,
    color: GlassColors.text.primary,
    padding: Spacing.md,
  },
});
