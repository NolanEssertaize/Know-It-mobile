/**
 * @file _layout.tsx
 * @description Root Layout - Connection-first initialization with Theme Support
 *
 * Flow:
 * 1. Show connecting screen
 * 2. Health check API with retry
 * 3. Once connected, check auth state
 * 4. Navigate to login or main app
 *
 * UPDATED: Added ThemeProvider for Light/Dark/System theme support
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store';
import { api } from '@/shared/api';
import { ThemeProvider, useTheme } from '@/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Connection states
type ConnectionState = 'connecting' | 'connected' | 'failed';

/**
 * Connection Gate Component
 * Blocks app until API connection is established
 * Now theme-aware!
 */
function ConnectionGate({ children }: { children: React.ReactNode }) {
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
    const [attempt, setAttempt] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const { initialize, isInitialized } = useAuthStore();

    // Get theme colors
    const { colors, isDark } = useTheme();

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
            <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
                <StatusBar style={isDark ? 'light' : 'dark'} />

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[
                        styles.logoOuter,
                        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                    ]}>
                        <View style={[
                            styles.logoMiddle,
                            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)' }
                        ]}>
                            <View style={[styles.logoInner, { backgroundColor: colors.text.primary }]}>
                                <Text style={[styles.logoText, { color: colors.text.inverse }]}>K</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* App Name */}
                <Text style={[styles.appName, { color: colors.text.primary }]}>KnowIt</Text>

                {/* Status */}
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="small" color={colors.text.primary} />
                    <Text style={[styles.statusText, { color: colors.text.secondary }]}>
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
 * Themed App Content
 * This component has access to useTheme() because it's inside ThemeProvider
 */
function ThemedAppContent() {
    const { colors, isDark } = useTheme();

    return (
        <ConnectionGate>
            <AuthNavigator>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            backgroundColor: colors.background.primary,
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
    );
}

/**
 * Root Layout Component
 * Wraps entire app with ThemeProvider
 */
export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <ThemedAppContent />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoMiddle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 28,
        fontWeight: '700',
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 48,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusText: {
        fontSize: 14,
    },
});