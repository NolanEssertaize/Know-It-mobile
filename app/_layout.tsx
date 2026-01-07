/**
 * @file _layout.tsx
 * @description Root Layout - Configuration de la navigation
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GlassColors } from '@/theme/colors';
import { WelcomeScreen } from '@/features/welcome';
import { useAppShell } from '@/features/app-shell';

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

const screenOptions = {
  headerStyle: {
    backgroundColor: GlassColors.gradient.start,
  },
  headerTintColor: GlassColors.text.primary,
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 18,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
  animation: 'slide_from_right' as const,
};

const modalOptions = {
  ...screenOptions,
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
  headerShown: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function RootLayout(): React.JSX.Element {
  const { showWelcome, handleWelcomeFinish } = useAppShell();

  if (showWelcome) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        <WelcomeScreen onFinish={handleWelcomeFinish} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[topicId]/index"
          options={{
            title: 'Historique',
          }}
        />
        <Stack.Screen
          name="[topicId]/session"
          options={{
            ...modalOptions,
            title: 'Session en cours',
          }}
        />
        <Stack.Screen
          name="[topicId]/result"
          options={{
            ...modalOptions,
            title: 'Analyse',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
