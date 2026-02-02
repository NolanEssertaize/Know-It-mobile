/**
 * @file ScreenWrapper/index.tsx
 * @description Base screen wrapper with safe areas and gradient background
 */

import React, { type ReactNode } from 'react';
import { View, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Spacing } from '@/theme';

interface ScreenWrapperProps {
  children: ReactNode;
  /** Enable scrolling */
  scrollable?: boolean;
  /** Padding around content */
  padding?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Include safe area insets */
  includeSafeArea?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  padding = Spacing.md,
  style,
  includeSafeArea = true,
}: ScreenWrapperProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    paddingTop: includeSafeArea ? insets.top : 0,
    paddingBottom: includeSafeArea ? insets.bottom : 0,
    paddingLeft: includeSafeArea ? insets.left : 0,
    paddingRight: includeSafeArea ? insets.right : 0,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    padding,
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[contentStyle, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, style]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
      style={[styles.container, containerStyle]}
    >
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
