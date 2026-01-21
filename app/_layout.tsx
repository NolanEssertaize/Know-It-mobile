/**
 * @file _layout.tsx
 * @description Root Layout - Connection-first initialization
 * 
 * Flow:
 * 1. Show connecting screen
 * 2. Health check API with retry
 * 3. Once connected, check auth state
 * 4. Navigate to login or main app
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store';
import { api } from '@/shared/api';
import { GlassColors } from '@/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Connection states
type ConnectionState = 'connecting' | 'connected' | 'failed';

/**
 * Connection Gate Component
 * Blocks app until API connection is established
 */
function ConnectionGate({ children }: { children: React.ReactNode }) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [attempt, setAttempt] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { initialize, isInitialized } = useAuthStore();

  /**
   * Attempt connection to API
   */
  const connectToApi = useCallback(async () => {
    setConnectionState('connecting');
    setError(null);

    console.log(`[ConnectionGate] Connection attempt ${attempt}...`);

    try {
      // Health check
      const isConnected = await api.checkConnection(1);

      if (isConnected) {
        console.log('[ConnectionGate] API connected');
        setConnectionState('connected');
        
        // Initialize auth after connection established
        await initialize();
        
        // Hide splash screen
        SplashScreen.hideAsync();
      } else {
        throw new Error('Health check failed');
      }
    } catch (err) {
      console.log(`[ConnectionGate] Connection attempt ${attempt} failed`);
      setError('Unable to connect to server');
      
      // Auto retry after delay
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`[ConnectionGate] Retrying in ${delay}ms...`);
      
      setTimeout(() => {
        setAttempt(prev => prev + 1);
      }, delay);
    }
  }, [attempt, initialize]);

  // Connect on mount and on retry
  useEffect(() => {
    connectToApi();
  }, [attempt]);

  // Show connecting screen until connected and auth initialized
  if (connectionState !== 'connected' || !isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoMiddle}>
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>K</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>KnowIt</Text>

        {/* Status */}
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={GlassColors.accent.primary} />
          <Text style={styles.statusText}>
            {error ? `Connecting... (attempt ${attempt})` : 'Connecting to server...'}
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Auth Navigation Handler
 */
function AuthNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, segments, navigationState?.key, router]);

  return <>{children}</>;
}

/**
 * Root Layout Component
 */
export default function RootLayout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ConnectionGate>
          <AuthNavigator>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: GlassColors.gradient.end,
                },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="index" />
              <Stack.Screen
                name="[topicId]/index"
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="[topicId]/session"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="[topicId]/result"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack>
          </AuthNavigator>
        </ConnectionGate>
      </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GlassColors.gradient.end,
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GlassColors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: GlassColors.text.primary,
    marginBottom: 48,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: GlassColors.text.secondary,
  },
});
