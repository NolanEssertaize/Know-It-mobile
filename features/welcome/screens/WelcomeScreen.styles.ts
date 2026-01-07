/**
 * @file WelcomeScreen.styles.ts
 * @description Styles pour l'écran de bienvenue
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlassColors.gradient.end,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  orbContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  orb: {
    position: 'absolute',
    borderRadius: 999,
  },

  orb1: {
    width: 200,
    height: 200,
    top: '10%',
    left: '5%',
    backgroundColor: GlassColors.accent.primary,
    opacity: 0.15,
  },

  orb2: {
    width: 150,
    height: 150,
    top: '30%',
    right: '10%',
    backgroundColor: GlassColors.accent.tertiary,
    opacity: 0.12,
  },

  orb3: {
    width: 180,
    height: 180,
    bottom: '20%',
    left: '15%',
    backgroundColor: GlassColors.accent.secondary,
    opacity: 0.1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  logoContainer: {
    marginBottom: 32,
  },

  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    padding: 3,
    ...Shadows.glow(GlassColors.accent.primary),
  },

  logoInner: {
    flex: 1,
    backgroundColor: GlassColors.gradient.middle,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoIcon: {
    fontSize: 48,
    fontWeight: '700',
    color: GlassColors.text.primary,
  },

  title: {
    fontSize: 42,
    fontWeight: '700',
    color: GlassColors.text.primary,
    marginBottom: 12,
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 16,
    color: GlassColors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: 200,
  },

  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  loadingProgress: {
    height: '100%',
    backgroundColor: GlassColors.accent.primary,
    borderRadius: 2,
  },
});
