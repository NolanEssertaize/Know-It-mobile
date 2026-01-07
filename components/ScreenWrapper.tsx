/**
 * ScreenWrapper Component
 * Wrapper global avec LinearGradient de fond pour tous les écrans
 */

import React, { ReactNode } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ViewStyle,
    StyleProp,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassColors } from '@/theme/theme';

interface ScreenWrapperProps {
    children: ReactNode;
    /** Appliquer le padding safe area */
    useSafeArea?: boolean;
    /** Padding personnalisé */
    padding?: number;
    /** Style additionnel */
    style?: StyleProp<ViewStyle>;
    /** Rendre le contenu scrollable */
    scrollable?: boolean;
    /** Activer KeyboardAvoidingView */
    keyboardAvoiding?: boolean;
    /** Couleurs du gradient personnalisées */
    gradientColors?: readonly [string, string, ...string[]];
    /** Afficher la StatusBar en light */
    statusBarStyle?: 'light-content' | 'dark-content';
    /** Centrer le contenu verticalement */
    centered?: boolean;
}

export function ScreenWrapper({
                                  children,
                                  useSafeArea = true,
                                  padding = 20,
                                  style,
                                  scrollable = false,
                                  keyboardAvoiding = true,
                                  gradientColors,
                                  statusBarStyle = 'light-content',
                                  centered = false,
                              }: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    const defaultGradient: readonly [string, string, string] = [
        GlassColors.gradient.start,
        GlassColors.gradient.middle,
        GlassColors.gradient.end,
    ];

    const safeAreaStyle = useSafeArea
        ? {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }
        : {};

    const contentStyle: ViewStyle = {
        flex: 1,
        padding,
        ...(centered && {
            justifyContent: 'center',
            alignItems: 'center',
        }),
    };

    const renderContent = () => {
        if (scrollable) {
            return (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { padding },
                        centered && styles.centeredContent,
                        style,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            );
        }

        return (
            <View style={[contentStyle, style]}>
                {children}
            </View>
        );
    };

    const content = (
        <LinearGradient
            colors={gradientColors || defaultGradient}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor="transparent"
                translucent
            />
            <View style={[styles.container, safeAreaStyle]}>
                {renderContent()}
            </View>
        </LinearGradient>
    );

    if (keyboardAvoiding && Platform.OS !== 'web') {
        return (
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {content}
            </KeyboardAvoidingView>
        );
    }

    return content;
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTES SPÉCIALISÉES
// ═══════════════════════════════════════════════════════════════════════════

/** Screen avec contenu centré (idéal pour modals, loading, etc.) */
export function CenteredScreen({
                                   children,
                                   ...props
                               }: Omit<ScreenWrapperProps, 'centered'>) {
    return (
        <ScreenWrapper centered {...props}>
            {children}
        </ScreenWrapper>
    );
}

/** Screen scrollable (idéal pour formulaires, listes) */
export function ScrollableScreen({
                                     children,
                                     ...props
                                 }: Omit<ScreenWrapperProps, 'scrollable'>) {
    return (
        <ScreenWrapper scrollable {...props}>
            {children}
        </ScreenWrapper>
    );
}

/** Modal screen (sans safe area top, avec padding bottom) */
export function ModalScreen({
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
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    gradient: {
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