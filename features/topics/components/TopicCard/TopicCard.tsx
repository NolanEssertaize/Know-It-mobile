/**
 * @file TopicCard.tsx
 * @description Carte de topic avec swipe actions
 */

import React, { memo, useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (swipeableRef.current) {
      registerRef(swipeableRef.current);
    }
    return () => unregisterRef();
  }, [registerRef, unregisterRef]);

  const renderRightActions = (progress: SharedValue<number>) => (
    <RightActions
      progress={progress}
      onEdit={onEdit}
      onShare={onShare}
      onDelete={onDelete}
    />
  );

  return (
    <View style={styles.swipeableContainer}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        overshootRight={false}
      >
        <Pressable style={styles.card} onPress={onPress}>
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
