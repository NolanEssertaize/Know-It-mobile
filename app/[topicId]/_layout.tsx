/**
 * @file app/[topicId]/_layout.tsx
 * @description Layout for topic detail routes with modal configuration
 */

import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function TopicLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: 'slide_from_right',
      }}
    >
      {/* Only declare screens that need non-default options */}
      <Stack.Screen
        name="session"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
