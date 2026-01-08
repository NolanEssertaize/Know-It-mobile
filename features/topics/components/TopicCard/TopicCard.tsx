/**
 * @file TopicCard.tsx
 * @description Carte de topic avec swipe actions
 *
 * MODIFICATIONS:
 * - Correction du bug où le slide déclenche le clic sur le topic
 * - Ajout du tracking de l'état de swipe pour empêcher le clic pendant/après le swipe
 */

import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import type { TopicItemData } from '../../hooks/useTopicsList';
import { GlassColors } from '@/theme';
import { styles } from './TopicCard.styles';

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
// SWIPE ACTIONS
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
            <Pressable style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.shareButton]} onPress={onShare}>
                <MaterialIcons name="share" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
                <MaterialIcons name="delete" size={20} color="#FFFFFF" />
            </Pressable>
        </Reanimated.View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
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

    // État pour tracker si le swipeable est ouvert ou en cours d'ouverture
    const [isSwipeOpen, setIsSwipeOpen] = useState(false);
    // Ref pour tracker si un swipe est en cours (pour éviter les clics pendant le swipe)
    const isSwipingRef = useRef(false);
    // Timeout ref pour réinitialiser l'état après un court délai
    const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (swipeableRef.current) {
            registerRef(swipeableRef.current);
        }
        return () => {
            unregisterRef();
            // Nettoyer le timeout si le composant est démonté
            if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
            }
        };
    }, [registerRef, unregisterRef]);

    // Callback quand le swipe commence
    const handleSwipeableWillOpen = useCallback(() => {
        isSwipingRef.current = true;
        setIsSwipeOpen(true);
    }, []);

    // Callback quand le swipe est complètement ouvert
    const handleSwipeableOpen = useCallback(() => {
        setIsSwipeOpen(true);
        // Réinitialiser le flag de swipe en cours après un court délai
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }
        swipeTimeoutRef.current = setTimeout(() => {
            isSwipingRef.current = false;
        }, 100);
    }, []);

    // Callback quand le swipe commence à se fermer
    const handleSwipeableWillClose = useCallback(() => {
        isSwipingRef.current = true;
    }, []);

    // Callback quand le swipe est complètement fermé
    const handleSwipeableClose = useCallback(() => {
        setIsSwipeOpen(false);
        // Réinitialiser le flag de swipe en cours après un court délai
        // pour éviter que le clic soit déclenché immédiatement après la fermeture
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }
        swipeTimeoutRef.current = setTimeout(() => {
            isSwipingRef.current = false;
        }, 150);
    }, []);

    // Handler de clic sécurisé
    const handleCardPress = useCallback(() => {
        // Ne pas déclencher le clic si :
        // 1. Le swipe est ouvert
        // 2. Un swipe est en cours
        if (isSwipeOpen || isSwipingRef.current) {
            // Si le swipe est ouvert, on le ferme au lieu de naviguer
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
                    style={styles.card}
                    onPress={handleCardPress}
                    // Désactiver le retour haptique pendant le swipe
                    android_disableSound={isSwipingRef.current}
                >
                    {/* Icône thématique */}
                    <LinearGradient
                        colors={theme.gradient as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconContainer}
                    >
                        <MaterialCommunityIcons
                            name={theme.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                            size={26}
                            color="#FFFFFF"
                        />
                    </LinearGradient>

                    {/* Infos du topic */}
                    <View style={styles.topicInfo}>
                        <Text style={styles.topicTitle} numberOfLines={1}>
                            {topic.title}
                        </Text>
                        <View style={styles.topicMeta}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="text-box-outline"
                                    size={14}
                                    color={GlassColors.text.secondary}
                                />
                                <Text style={styles.metaText}>
                                    {topic.sessions.length} session{topic.sessions.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={styles.metaDot} />
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={14}
                                    color={GlassColors.text.secondary}
                                />
                                <Text style={styles.metaText}>{lastSessionDate}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chevron */}
                    <View style={styles.chevronContainer}>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.accent.primary}
                        />
                    </View>
                </Pressable>
            </ReanimatedSwipeable>
        </View>
    );
});