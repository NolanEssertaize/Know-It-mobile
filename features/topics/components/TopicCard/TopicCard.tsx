/**
 * @file TopicCard.tsx
 * @description Carte de topic avec swipe actions - Theme Aware
 *
 * FIXED:
 * - All colors now use useTheme() hook
 * - Swipe action buttons adaptive to theme
 */

import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import ReanimatedSwipeable, {
    type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
    type SharedValue,
    useAnimatedStyle,
    interpolate,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { TopicItemData } from '../../hooks/useTopicsList';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TopicCardProps {
    data: TopicItemData;
    onPress: () => void;
    onEdit: () => void;
    onShare: () => void;
    onDelete: () => void;
    registerRef: (ref: SwipeableMethods) => void;
    unregisterRef: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// SWIPE ACTIONS - Theme Aware
// ═══════════════════════════════════════════════════════════════════════════

interface RightActionsProps {
    progress: SharedValue<number>;
    onEdit: () => void;
    onShare: () => void;
    onDelete: () => void;
}

const RightActions = memo(function RightActions({
    progress,
    onEdit,
    onShare,
    onDelete,
}: RightActionsProps) {
    const { colors } = useTheme();
    
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
        transform: [
            {
                translateX: interpolate(progress.value, [0, 1], [100, 0]),
            },
        ],
    }));

    return (
        <Reanimated.View style={[styles.actionsContainer, animatedStyle]}>
            {/* Edit Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    { 
                        backgroundColor: colors.surface.glass,
                        borderWidth: 1,
                        borderColor: colors.glass.borderLight,
                    },
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onEdit}
            >
                <MaterialIcons name="edit" size={20} color={colors.text.primary} />
            </Pressable>

            {/* Share Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    { 
                        backgroundColor: colors.surface.glass,
                        borderWidth: 1,
                        borderColor: colors.glass.borderLight,
                    },
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onShare}
            >
                <MaterialIcons name="share" size={20} color={colors.text.primary} />
            </Pressable>

            {/* Delete Button - HIGH CONTRAST */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.text.primary },
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onDelete}
            >
                <MaterialIcons name="delete" size={20} color={colors.text.inverse} />
            </Pressable>
        </Reanimated.View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicCard = memo(function TopicCard({
    data,
    onPress,
    onEdit,
    onShare,
    onDelete,
    registerRef,
    unregisterRef,
}: TopicCardProps) {
    const swipeableRef = useRef<SwipeableMethods>(null);
    const { topic, theme, lastSessionDate } = data;
    const { colors } = useTheme();

    const [isSwipeOpen, setIsSwipeOpen] = useState(false);
    const isSwipingRef = useRef(false);
    const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (swipeableRef.current) {
            registerRef(swipeableRef.current);
        }
        return () => {
            unregisterRef();
            if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
            }
        };
    }, [registerRef, unregisterRef]);

    const handleSwipeableWillOpen = useCallback(() => {
        isSwipingRef.current = true;
        setIsSwipeOpen(true);
    }, []);

    const handleSwipeableOpen = useCallback(() => {
        setIsSwipeOpen(true);
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }
        swipeTimeoutRef.current = setTimeout(() => {
            isSwipingRef.current = false;
        }, 100);
    }, []);

    const handleSwipeableWillClose = useCallback(() => {
        isSwipingRef.current = true;
    }, []);

    const handleSwipeableClose = useCallback(() => {
        setIsSwipeOpen(false);
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }
        swipeTimeoutRef.current = setTimeout(() => {
            isSwipingRef.current = false;
        }, 150);
    }, []);

    const handleCardPress = useCallback(() => {
        if (isSwipeOpen || isSwipingRef.current) {
            if (isSwipeOpen && swipeableRef.current) {
                swipeableRef.current.close();
            }
            return;
        }
        onPress();
    }, [isSwipeOpen, onPress]);

    const renderRightActions = useCallback(
        (progress: SharedValue<number>) => (
            <RightActions
                progress={progress}
                onEdit={onEdit}
                onShare={onShare}
                onDelete={onDelete}
            />
        ),
        [onEdit, onShare, onDelete]
    );

    return (
        <View style={styles.swipeableContainer}>
            <ReanimatedSwipeable
                ref={swipeableRef}
                friction={2}
                rightThreshold={40}
                renderRightActions={renderRightActions}
                overshootRight={false}
                onSwipeableWillOpen={handleSwipeableWillOpen}
                onSwipeableOpen={handleSwipeableOpen}
                onSwipeableWillClose={handleSwipeableWillClose}
                onSwipeableClose={handleSwipeableClose}
            >
                <Pressable
                    style={({ pressed }) => [
                        styles.card,
                        { 
                            backgroundColor: colors.surface.glass,
                            borderColor: colors.glass.border,
                        },
                        pressed && styles.cardPressed,
                    ]}
                    onPress={handleCardPress}
                >
                    {/* Topic Icon Container */}
                    <View style={[styles.iconContainer, { backgroundColor: colors.surface.glassLight }]}>
                        <MaterialCommunityIcons
                            name={theme.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                            size={26}
                            color={colors.text.primary}
                        />
                    </View>

                    {/* Topic Info */}
                    <View style={styles.topicInfo}>
                        <Text style={[styles.topicTitle, { color: colors.text.primary }]} numberOfLines={1}>
                            {topic.title}
                        </Text>
                        <View style={styles.topicMeta}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="text-box-outline"
                                    size={14}
                                    color={colors.text.secondary}
                                />
                                <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                                    {topic.sessions.length} session{topic.sessions.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={[styles.metaDot, { backgroundColor: colors.text.muted }]} />
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={14}
                                    color={colors.text.secondary}
                                />
                                <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                                    {lastSessionDate}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Chevron */}
                    <View style={styles.chevronContainer}>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </View>
                </Pressable>
            </ReanimatedSwipeable>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES (Static - colors applied inline)
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: Spacing.md,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },

    cardPressed: {
        opacity: 0.8,
    },

    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    topicInfo: {
        flex: 1,
    },

    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },

    topicMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    metaText: {
        fontSize: 12,
    },

    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: Spacing.sm,
    },

    chevronContainer: {
        padding: Spacing.xs,
    },

    // Swipe Actions
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: Spacing.sm,
    },

    actionButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.xs,
    },

    actionButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
});

export default TopicCard;
