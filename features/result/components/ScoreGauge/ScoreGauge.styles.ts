/**
 * @file ScoreGauge.styles.ts
 * @description Styles pour le composant ScoreGauge
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },

  gaugeContainer: {
    width: 180,
    height: 90,
    marginBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },

  gaugeBackground: {
    position: 'absolute',
    width: '100%',
    height: '200%',
    flexDirection: 'row',
  },

  gaugeHalf: {
    flex: 1,
    backgroundColor: GlassColors.glass.background,
    borderRadius: 90,
  },

  gaugeLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  gaugeRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  gaugeProgress: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '50%',
    height: '200%',
    transformOrigin: 'right center',
  },

  gaugeProgressInner: {
    flex: 1,
    borderTopLeftRadius: 90,
    borderBottomLeftRadius: 90,
  },

  gaugeCenter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },

  scoreUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: GlassColors.text.secondary,
    marginBottom: 6,
    marginLeft: 2,
  },

  label: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
