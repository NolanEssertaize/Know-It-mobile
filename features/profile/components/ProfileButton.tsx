/**
 * @file ProfileButton.tsx
 * @description Bouton de profil avec icône - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme, Spacing, BorderRadius } from '@/theme';

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
    const { colors } = useTheme();
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
                    backgroundColor: colors.surface.glass,
                    borderColor: colors.glass.border,
                },
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {initials ? (
                <Text 
                    style={[
                        styles.initials, 
                        { 
                            fontSize: config.fontSize,
                            color: colors.text.primary,
                        }
                    ]}
                >
                    {initials.charAt(0).toUpperCase()}
                </Text>
            ) : (
                <MaterialIcons
                    name="person"
                    size={config.icon}
                    color={colors.text.primary}
                />
            )}
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        fontWeight: '600',
    },
});

export default ProfileButton;
