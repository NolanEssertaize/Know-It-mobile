/**
 * @file AnalysisSection.tsx
 * @description Composant d'affichage d'une section d'analyse - Theme Aware
 *
 * FIXED: Uses color prop from parent (which uses useTheme)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export interface AnalysisSectionProps {
    /** Section title */
    readonly title: string;
    /** Material Icon name */
    readonly icon: string;
    /** List of items */
    readonly items: readonly string[];
    /** Section color (passed from parent using useTheme) */
    readonly color: string;
    /** Glow color for the container (optional) */
    readonly glowColor?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface AnalysisItemProps {
    readonly text: string;
    readonly color: string;
    readonly textColor: string;
}

const AnalysisItem = memo(function AnalysisItem({ text, color, textColor }: AnalysisItemProps): React.JSX.Element {
    return (
        <View style={styles.itemContainer}>
            <View style={[styles.itemBullet, { backgroundColor: color }]} />
            <Text style={[styles.itemText, { color: textColor }]}>{text}</Text>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function AnalysisSectionComponent({
    title,
    icon,
    items,
    color,
    glowColor,
}: AnalysisSectionProps): React.JSX.Element | null {
    const { colors } = useTheme();

    if (items.length === 0) {
        return null;
    }

    return (
        <GlassView 
            variant="default" 
            glow={!!glowColor} 
            glowColor={glowColor} 
            style={styles.container}
        >
            <View style={styles.header}>
                <MaterialIcons name={icon as MaterialIconName} size={20} color={color} />
                <Text style={[styles.title, { color }]}>{title}</Text>
                <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.badgeText, { color }]}>{items.length}</Text>
                </View>
            </View>

            <View style={styles.itemsList}>
                {items.map((item, index) => (
                    <AnalysisItem 
                        key={`${title}-${index}`} 
                        text={item} 
                        color={color}
                        textColor={colors.text.primary}
                    />
                ))}
            </View>
        </GlassView>
    );
}

export const AnalysisSection = memo(AnalysisSectionComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    title: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginLeft: Spacing.sm,
    },

    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        minWidth: 28,
        alignItems: 'center',
    },

    badgeText: {
        fontSize: 13,
        fontWeight: '700',
    },

    itemsList: {
        gap: Spacing.sm,
    },

    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingLeft: Spacing.xs,
    },

    itemBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        marginRight: Spacing.sm,
    },

    itemText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
});

export default AnalysisSection;
