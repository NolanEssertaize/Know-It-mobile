/**
 * @file LegalContent.tsx
 * @description Reusable component for displaying structured legal documents.
 * Theme-aware, accessible, with collapsible sections.
 */

import React, { memo, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    LayoutAnimation,
    UIManager,
    Linking,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { LegalSection } from '@/shared/legal';

const URL_REGEX = /(https?:\/\/[^\s,)]+)/g;

/**
 * Splits text on URLs and renders URLs as tappable links.
 */
function renderTextWithLinks(
    text: string,
    textStyle: any,
    linkColor: string,
) {
    const parts = text.split(URL_REGEX);
    if (parts.length === 1) return text; // no URLs found

    return parts.map((part, i) =>
        URL_REGEX.test(part) ? (
            <Text
                key={i}
                style={{ color: linkColor, textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL(part)}
            >
                {part}
            </Text>
        ) : (
            <Text key={i}>{part}</Text>
        )
    );
}

interface LegalContentProps {
    title: string;
    sections: LegalSection[];
}

function LegalContentComponent({ title, sections }: LegalContentProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [expandedSections, setExpandedSections] = useState<Set<number>>(
        () => new Set(sections.map((_, i) => i)) // all expanded by default
    );

    const toggleSection = useCallback((index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text
                    style={[styles.headerTitle, { color: colors.text.primary }]}
                    accessibilityRole="header"
                >
                    {title}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + Spacing.xxl },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {sections.map((section, index) => {
                    const isExpanded = expandedSections.has(index);

                    return (
                        <View key={index} style={styles.sectionContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionHeader,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(0, 0, 0, 0.03)',
                                    },
                                ]}
                                onPress={() => toggleSection(index)}
                                activeOpacity={0.7}
                                accessibilityRole="header"
                                accessibilityState={{ expanded: isExpanded }}
                            >
                                <Text
                                    style={[styles.sectionTitle, { color: colors.text.primary }]}
                                    numberOfLines={2}
                                >
                                    {section.title}
                                </Text>
                                <MaterialIcons
                                    name={isExpanded ? 'expand-less' : 'expand-more'}
                                    size={24}
                                    color={colors.text.muted}
                                />
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.sectionBody}>
                                    <Text
                                        style={[styles.sectionContent, { color: colors.text.secondary }]}
                                        selectable
                                    >
                                        {renderTextWithLinks(
                                            section.content,
                                            styles.sectionContent,
                                            colors.text.primary,
                                        )}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

export const LegalContent = memo(LegalContentComponent);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    sectionContainer: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        marginRight: Spacing.sm,
    },
    sectionBody: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    sectionContent: {
        fontSize: 14,
        lineHeight: 22,
    },
});
