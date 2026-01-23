/**
 * @file CategoryFilter.tsx
 * @description Filtre horizontal par catégories - Theme Aware
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { CATEGORIES } from '../../hooks/useTopicsList';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const CategoryFilter = memo(function CategoryFilter({
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;

                    return (
                        <Pressable
                            key={cat.id}
                            onPress={() => onSelectCategory(cat.id)}
                            style={({ pressed }) => [
                                styles.chip,
                                { 
                                    backgroundColor: isActive 
                                        ? colors.text.primary 
                                        : colors.surface.glass,
                                    borderColor: isActive 
                                        ? colors.text.primary 
                                        : colors.glass.borderLight,
                                },
                                pressed && styles.chipPressed,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={cat.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                                size={16}
                                color={isActive ? colors.text.inverse : colors.text.primary}
                            />
                            <Text 
                                style={[
                                    styles.label, 
                                    { 
                                        color: isActive 
                                            ? colors.text.inverse 
                                            : colors.text.primary,
                                        fontWeight: isActive ? '600' : '500',
                                    }
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.sm,
    },

    contentContainer: {
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
        borderWidth: 1,
    },

    chipPressed: {
        opacity: 0.8,
    },

    label: {
        fontSize: 14,
    },
});

export default CategoryFilter;
