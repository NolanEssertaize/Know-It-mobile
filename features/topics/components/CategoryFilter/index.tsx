/**
 * @file CategoryFilter/index.tsx
 * @description Horizontal scrollable category filter chips
 */

import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';

interface CategoryFilterProps {
  categories: readonly string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryFilter = memo(function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handlePress = (category: string) => {
    if (selectedCategory === category) {
      onSelectCategory(null); // Deselect if already selected
    } else {
      onSelectCategory(category);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Topics Button */}
        <TouchableOpacity
          style={[
            styles.chip,
            { 
              backgroundColor: !selectedCategory 
                ? colors.accent.primary 
                : colors.surface.glass,
              borderColor: !selectedCategory 
                ? colors.accent.primary 
                : colors.glass.border,
            },
          ]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="apps"
            size={16}
            color={!selectedCategory ? colors.text.inverse : colors.text.secondary}
          />
          <Text
            style={[
              styles.chipText,
              { 
                color: !selectedCategory ? colors.text.inverse : colors.text.secondary,
              },
            ]}
          >
            {t('topics.filter.all')}
          </Text>
        </TouchableOpacity>

        {/* Category Chips */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const iconName = getCategoryIcon(category);

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                { 
                  backgroundColor: isSelected 
                    ? colors.accent.primary 
                    : colors.surface.glass,
                  borderColor: isSelected 
                    ? colors.accent.primary 
                    : colors.glass.border,
                },
              ]}
              onPress={() => handlePress(category)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={iconName}
                size={16}
                color={isSelected ? colors.text.inverse : colors.text.secondary}
              />
              <Text
                style={[
                  styles.chipText,
                  { 
                    color: isSelected ? colors.text.inverse : colors.text.secondary,
                  },
                ]}
              >
                {t(`topics.categories.${category.toLowerCase()}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

function getCategoryIcon(category: string): keyof typeof MaterialIcons.glyphMap {
  const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    science: 'science',
    technology: 'computer',
    math: 'calculate',
    history: 'history-edu',
    language: 'translate',
    arts: 'palette',
    business: 'business',
    health: 'health-and-safety',
    other: 'category',
  };
  return icons[category.toLowerCase()] || 'folder';
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  chipText: {
    ...Typography.body.small,
    fontWeight: '500',
  },
});
