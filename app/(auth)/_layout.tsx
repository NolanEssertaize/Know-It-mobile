/**
 * @file _layout.tsx
 * @description Auth group layout (Expo Router) - Theme Aware
 * 
 * FIXED: StatusBar now adapts to theme
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

export default function AuthLayout() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Register',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}
