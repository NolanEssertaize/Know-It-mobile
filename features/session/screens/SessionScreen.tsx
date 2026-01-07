/**
 * @file SessionScreen.tsx
 * @description Écran d'enregistrement vocal (Vue Dumb)
 */

import React, { memo } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView, RecordButton } from '@/shared/components';
import { GlassColors } from '@/theme';

import { useSession } from '../hooks/useSession';
import { styles } from './SessionScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionScreen = memo(function SessionScreen() {
  // Setup Hook - Logic Controller
  const logic = useSession();
  const insets = useSafeAreaInsets();

  // ─────────────────────────────────────────────────────────────────────────
  // GUARD: Topic not found
  // ─────────────────────────────────────────────────────────────────────────

  if (!logic.topic) {
    return (
      <ScreenWrapper centered>
        <Text style={styles.errorText}>Topic introuvable</Text>
      </ScreenWrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ScreenWrapper useSafeArea={false} padding={0}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={logic.handleClose}>
            <MaterialIcons
              name="close"
              size={24}
              color={GlassColors.text.primary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Session</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Topic Badge */}
          <GlassView style={styles.topicBadge} borderRadius="full">
            <Text style={styles.topicTitle}>{logic.topic.title}</Text>
          </GlassView>

          {/* Status */}
          {logic.isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={GlassColors.accent.primary} />
              <Text style={styles.analyzingText}>Analyse en cours...</Text>
              <Text style={styles.analyzingHint}>
                Traitement de votre enregistrement
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {logic.isRecording ? 'Enregistrement...' : 'Prêt à enregistrer'}
                </Text>
                <Text style={styles.statusHint}>
                  {logic.isRecording
                    ? 'Expliquez le sujet avec vos mots'
                    : 'Appuyez sur le bouton pour commencer'}
                </Text>
              </View>

              {/* Record Button */}
              <View style={styles.recordButtonContainer}>
                <RecordButton
                  isRecording={logic.isRecording}
                  onPress={logic.toggleRecording}
                  size={120}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
});
