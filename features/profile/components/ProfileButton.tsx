/**
 * @file ProfileButton.tsx
 * @description Bouton de profil avec icône pour la navigation
 * 
 * À placer dans le header de l'écran principal
 */

import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ProfileButtonProps {
  /** User's initials (optional - shows icon if not provided) */
  initials?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ═══════════════════════════════════════════════════════════════════════════
// SIZE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const SIZE_CONFIG = {
  sm: { container: 36, icon: 20, fontSize: 14 },
  md: { container: 44, icon: 24, fontSize: 16 },
  lg: { container: 52, icon: 28, fontSize: 18 },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProfileButton = memo(function ProfileButton({
  initials,
  size = 'md',
}: ProfileButtonProps) {
  const router = useRouter();
  const config = SIZE_CONFIG[size];

  const handlePress = useCallback(() => {
    router.push('/profile');
  }, [router]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: config.container,
          height: config.container,
          borderRadius: config.container / 2,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {initials ? (
        <Text style={[styles.initials, { fontSize: config.fontSize }]}>
          {initials.charAt(0).toUpperCase()}
        </Text>
      ) : (
        <MaterialIcons
          name="person"
          size={config.icon}
          color={GlassColors.text.primary}
        />
      )}
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    backgroundColor: GlassColors.glass.background,
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  initials: {
    color: GlassColors.text.primary,
    fontWeight: '600',
  },
});
