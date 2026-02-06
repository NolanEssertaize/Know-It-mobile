/**
 * @file (tabs)/_layout.tsx
 * @description Tab navigator with iOS-native glassmorphism floating bar
 *
 * Layout: [Home] [Flashcards] ──────────────── [+]
 * Native iOS translucent material, floating pill shape
 */

import { Tabs } from 'expo-router';
import { View, Pressable, Text, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, Spacing } from '@/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const BAR_HEIGHT = 62;
const BAR_RADIUS = BAR_HEIGHT / 2;
const ADD_SIZE = 56;
const TAB_HIT = 56;

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM TAB BAR
// ═══════════════════════════════════════════════════════════════════════════

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleAddTopic = () => {
        router.push('/(tabs)/?showAddModal=true');
    };

    const borderColor = isDark
        ? 'rgba(255, 255, 255, 0.14)'
        : 'rgba(0, 0, 0, 0.10)';

    return (
        <View
            style={[
                styles.wrapper,
                { paddingBottom: Math.max(insets.bottom, 8) },
            ]}
            pointerEvents="box-none"
        >
            <View style={[styles.bar, { borderColor }]}>
                {/* Blur / translucent background */}
                {Platform.OS === 'ios' ? (
                    <BlurView
                        intensity={80}
                        tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
                        style={StyleSheet.absoluteFill}
                    />
                ) : (
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(30, 30, 30, 0.82)'
                                    : 'rgba(250, 250, 250, 0.85)',
                            },
                        ]}
                    />
                )}

                {/* ── Left: Navigation Tabs ── */}
                <View style={styles.tabsGroup}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const label = options.title ?? route.name;
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] =
                            route.name === 'index' ? 'home' : 'cards';

                        return (
                            <Pressable
                                key={route.key}
                                onPress={onPress}
                                style={({ pressed }) => [
                                    styles.tabButton,
                                    isFocused && {
                                        backgroundColor: isDark
                                            ? 'rgba(255,255,255,0.10)'
                                            : 'rgba(0,0,0,0.06)',
                                    },
                                    pressed && styles.pressed,
                                ]}
                                android_ripple={{
                                    color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                                    borderless: true,
                                    radius: TAB_HIT / 2,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={26}
                                    color={isFocused ? colors.text.primary : colors.text.muted}
                                />
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        {
                                            color: isFocused ? colors.text.primary : colors.text.muted,
                                            fontWeight: isFocused ? '600' : '400',
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* ── Right: Add Button ── */}
                <Pressable
                    onPress={handleAddTopic}
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.pressed,
                    ]}
                    android_ripple={{
                        color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
                        borderless: true,
                        radius: ADD_SIZE / 2,
                    }}
                >
                    <Ionicons
                        name={Platform.OS === 'ios' ? 'add' : 'add-outline'}
                        size={32}
                        color={colors.text.primary}
                    />
                </Pressable>
            </View>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                animation: 'none',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ title: 'Home' }}
            />
            <Tabs.Screen
                name="flashcards"
                options={{ title: 'Flashcards' }}
            />
        </Tabs>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.md,
    },
    bar: {
        height: BAR_HEIGHT,
        borderRadius: BAR_RADIUS,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: StyleSheet.hairlineWidth,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    tabsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        gap: 4,
    },
    tabButton: {
        height: TAB_HIT,
        paddingHorizontal: 16,
        borderRadius: TAB_HIT / 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    tabLabel: {
        fontSize: 15,
        letterSpacing: 0.1,
    },
    addButton: {
        width: ADD_SIZE,
        height: ADD_SIZE,
        borderRadius: ADD_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 3,
    },
    pressed: {
        opacity: 0.55,
        transform: [{ scale: 0.93 }],
    },
});
