/**
 * @file FlashcardsEditorScreen.tsx
 * @description Screen for reviewing and editing generated flashcards
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useFlashcardEditor } from '../hooks/useFlashcardEditor';
import { FlashcardEditorCard } from '../components/FlashcardEditorCard';

function FlashcardsEditorScreenComponent(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    cards,
    isGenerating,
    isSaving,
    error,
    topicTitle,
    updateCard,
    deleteCard,
    addCard,
    saveCards,
    handleClose,
  } = useFlashcardEditor();

  // Loading state
  if (isGenerating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.text.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          {t('flashcards.editor.generating')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          style={[
            styles.closeButton,
            {
              backgroundColor: colors.glass.background,
              borderColor: colors.glass.borderLight,
            },
          ]}
          onPress={handleClose}
        >
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {t('flashcards.editor.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {t('flashcards.editor.subtitle', { count: cards.length })}
          </Text>
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: `${colors.text.primary}10` }]}>
          <MaterialIcons name="error-outline" size={20} color={colors.text.primary} />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>{error}</Text>
        </View>
      )}

      {/* Cards List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((card, index) => (
          <FlashcardEditorCard
            key={card.id}
            card={card}
            index={index}
            onUpdateFront={(value) => updateCard(card.id, 'front', value)}
            onUpdateBack={(value) => updateCard(card.id, 'back', value)}
            onDelete={() => deleteCard(card.id)}
          />
        ))}

        {/* Add Card Button */}
        <Pressable
          style={[
            styles.addCardButton,
            {
              borderColor: colors.glass.borderDivider,
              backgroundColor: colors.glass.background,
            },
          ]}
          onPress={addCard}
        >
          <MaterialIcons name="add" size={24} color={colors.text.secondary} />
          <Text style={[styles.addCardText, { color: colors.text.secondary }]}>
            {t('flashcards.editor.addCard')}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.actionBar,
          {
            paddingBottom: insets.bottom + Spacing.md,
            backgroundColor: colors.background.primary,
            borderTopColor: colors.glass.borderDivider,
          },
        ]}
      >
        {/* Cancel */}
        <Pressable
          style={[
            styles.buttonOutline,
            {
              backgroundColor: colors.glass.background,
              borderColor: colors.glass.borderLight,
            },
          ]}
          onPress={handleClose}
          disabled={isSaving}
        >
          <Text style={[styles.buttonOutlineText, { color: colors.text.primary }]}>
            {t('common.cancel')}
          </Text>
        </Pressable>

        <View style={styles.actionSpacer} />

        {/* Save */}
        <Pressable
          style={[
            styles.buttonPrimary,
            { backgroundColor: colors.text.primary },
            isSaving && styles.buttonDisabled,
          ]}
          onPress={saveCards}
          disabled={isSaving || cards.length === 0}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color={colors.text.inverse} />
              <Text style={[styles.buttonPrimaryText, { color: colors.text.inverse }]}>
                {t('flashcards.editor.save')}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export const FlashcardsEditorScreen = memo(FlashcardsEditorScreenComponent);
export default FlashcardsEditorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  headerTextContainer: {
    flex: 1,
    paddingTop: Spacing.xs,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: 14,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },

  errorText: {
    flex: 1,
    fontSize: 14,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },

  addCardText: {
    fontSize: 16,
    fontWeight: '600',
  },

  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },

  buttonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },

  buttonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
  },

  actionSpacer: {
    width: Spacing.md,
  },

  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
