/**
 * @file _layout.example.tsx
 * @description Example Root Layout with ThemeProvider
 *
 * Shows how to integrate the ThemeProvider into your Expo Router app.
 * Copy relevant parts to your app/_layout.tsx
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Import theme
import { ThemeProvider, useTheme } from '@/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// ═══════════════════════════════════════════════════════════════════════════
// THEMED APP CONTENT
// This component has access to useTheme() because it's inside ThemeProvider
// ═══════════════════════════════════════════════════════════════════════════

function ThemedAppContent() {
  const { colors, isDark } = useTheme();

  return (
    <LinearGradient
      colors={[
        colors.gradient.start,
        colors.gradient.middle,
        colors.gradient.end,
      ]}
      style={styles.gradient}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        {/* Your screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="[topicId]"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="profile" />
        <Stack.Screen name="auth" />
      </Stack>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export default function RootLayout() {
  // Load fonts if needed
  const [fontsLoaded] = useFonts({
    // Add your custom fonts here
  });

  // Handle font loading
  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* WRAP YOUR APP WITH ThemeProvider */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <ThemeProvider>
          <ThemedAppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
