/**
 * @file ScreenWrapper.tsx
 * @description Wrapper global avec fond adaptatif - Theme Aware
 *
 * FIXED: Uses useTheme() for dynamic colors
 */

import React, { memo, type ReactNode } from 'react';
import {
    View,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    type ViewStyle,
    type StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Spacing } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScreenWrapperProps {
    children: ReactNode;
    useSafeArea?: boolean;
    padding?: number;
    style?: StyleProp<ViewStyle>;
    scrollable?: boolean;
    keyboardAvoiding?: boolean;
    /** Override status bar style (defaults to theme-aware) */
    statusBarStyle?: 'light-content' | 'dark-content';
    centered?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const ScreenWrapper = memo(function ScreenWrapper({
    children,
    useSafeArea = true,
    padding = 20,
    style,
    scrollable = false,
    keyboardAvoiding = true,
    statusBarStyle,
    centered = false,
}: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    // Safe area padding
    const safeAreaStyle: ViewStyle = useSafeArea
        ? {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }
        : {};

    // Content style
    const contentStyle: ViewStyle = {
        flex: 1,
        padding,
        ...(centered && {
            justifyContent: 'center',
            alignItems: 'center',
        }),
    };

    // Render content
    const content = scrollable ? (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
                styles.scrollContent,
                contentStyle,
                centered && styles.centeredContent,
                style,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    ) : (
        <View style={[contentStyle, style]}>
            {children}
        </View>
    );

    // Wrap with keyboard avoiding if needed
    const wrappedContent = keyboardAvoiding ? (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            {content}
        </KeyboardAvoidingView>
    ) : content;

    return (
        <View style={[
            styles.container, 
            safeAreaStyle, 
            { backgroundColor: colors.background.primary }
        ]}>
            <StatusBar 
                barStyle={statusBarStyle ?? (isDark ? 'light-content' : 'dark-content')} 
            />
            {wrappedContent}
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTES SPÉCIALISÉES
// ═══════════════════════════════════════════════════════════════════════════

export const CenteredScreen = memo(function CenteredScreen({
    children,
    ...props
}: Omit<ScreenWrapperProps, 'centered'>) {
    return (
        <ScreenWrapper centered {...props}>
            {children}
        </ScreenWrapper>
    );
});

export const ScrollableScreen = memo(function ScrollableScreen({
    children,
    ...props
}: Omit<ScreenWrapperProps, 'scrollable'>) {
    return (
        <ScreenWrapper scrollable {...props}>
            {children}
        </ScreenWrapper>
    );
});

export const ModalScreen = memo(function ModalScreen({
    children,
    style,
    ...props
}: Omit<ScreenWrapperProps, 'useSafeArea'>) {
    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper
            useSafeArea={false}
            style={[{ paddingBottom: insets.bottom }, style]}
            {...props}
        >
            {children}
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    centeredContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ScreenWrapper;
