/**
 * @file CategoryFilter.tsx
 * @description Filtre horizontal par catégories
 */

import React, { memo } from 'react';
import { ScrollView, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GlassView } from '@/shared/components';
import { CATEGORIES } from '../../hooks/useTopicsList';
import { GlassColors } from '@/theme';
import { styles } from './CategoryFilter.styles';

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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;

        return (
          <Pressable key={cat.id} onPress={() => onSelectCategory(cat.id)}>
            {isActive ? (
              <LinearGradient
                colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chip}
              >
                <MaterialCommunityIcons
                  name={cat.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={16}
                  color={GlassColors.text.primary}
                />
                <Text style={styles.labelActive}>{cat.label}</Text>
              </LinearGradient>
            ) : (
              <GlassView style={styles.chip}>
                <MaterialCommunityIcons
                  name={cat.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={16}
                  color={GlassColors.text.secondary}
                />
                <Text style={styles.label}>{cat.label}</Text>
              </GlassView>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
