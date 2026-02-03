/**
 * @file CategoryFilter.tsx
 * @description Filtre horizontal par catégories - Theme Aware + i18n
 *
 * MERGED:
 * - MAIN branch: All styles and component structure preserved
 * - i18nV2 branch: Translation hooks injected for category labels
 *
 * FIXED: All colors now use useTheme() hook
 */

import React, { memo, useMemo } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Category {
    id: string;
    labelKey: string;
    fallbackLabel: string;
    icon: string;
}

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS - Categories with translation keys
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORIES: Category[] = [
    { id: 'all', labelKey: 'topics.categories.all', fallbackLabel: 'Tous', icon: 'view-grid' },
    { id: 'recent', labelKey: 'topics.categories.recent', fallbackLabel: 'Récents', icon: 'clock-outline' },
    { id: 'favorites', labelKey: 'topics.categories.favorites', fallbackLabel: 'Favoris', icon: 'star-outline' },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const CategoryFilter = memo(function CategoryFilter({
                                                               selectedCategory,
                                                               onSelectCategory,
                                                           }: CategoryFilterProps) {
    const { t } = useTranslation();
    const { colors } = useTheme();

    // Memoize translated categories
    const translatedCategories = useMemo(() => {
        return CATEGORIES.map(cat => ({
            ...cat,
            label: t(cat.labelKey, cat.fallbackLabel),
        }));
    }, [t]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {translatedCategories.map((cat) => {
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