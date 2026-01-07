/**
 * @file colors.ts
 * @description Design tokens - Palette Glassmorphism
 */

export const GlassColors = {
  gradient: {
    start: '#1a1f2e',
    middle: '#151a28',
    end: '#0d1117',
  },

  glass: {
    background: 'rgba(255, 255, 255, 0.08)',
    backgroundLight: 'rgba(255, 255, 255, 0.12)',
    backgroundDark: 'rgba(0, 0, 0, 0.3)',
    border: 'rgba(255, 255, 255, 0.15)',
    borderLight: 'rgba(255, 255, 255, 0.25)',
  },

  accent: {
    primary: '#00D4FF',
    secondary: '#0EA5E9',
    tertiary: '#6366F1',
    glow: 'rgba(0, 212, 255, 0.3)',
  },

  semantic: {
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.3)',
    warning: '#F59E0B',
    warningGlow: 'rgba(245, 158, 11, 0.3)',
    error: '#EF4444',
    errorGlow: 'rgba(239, 68, 68, 0.3)',
    info: '#3B82F6',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    muted: '#52525B',
    accent: '#00D4FF',
  },

  surface: {
    elevated: 'rgba(255, 255, 255, 0.05)',
    pressed: 'rgba(255, 255, 255, 0.15)',
    disabled: 'rgba(255, 255, 255, 0.03)',
  },
} as const;

export type GlassColorsType = typeof GlassColors;
