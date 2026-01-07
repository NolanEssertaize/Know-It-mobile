/**
 * @file borders.ts
 * @description Design tokens - Border radius
 */

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export type BorderRadiusType = typeof BorderRadius;
export type BorderRadiusKey = keyof BorderRadiusType;
