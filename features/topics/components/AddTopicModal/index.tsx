/**
 * @file AddTopicModal/index.tsx
 * @description Modal for adding new topics
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, Typography } from '@/theme';

interface AddTopicModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const AddTopicModal = memo(function AddTopicModal({
  visible,
  value,
  onChangeText,
  onSubmit,
  onClose,
  isLoading = false,
}: AddTopicModalProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <TouchableWithoutFeedback>
              <GlassView
                style={[styles.modal, { backgroundColor: isDark ? colors.background.secondary : colors.surface.card }]}
                padding="lg"
                radius="xl"
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.text.primary }]}>
                    {t('topics.add.title')}
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Input */}
                <View style={[styles.inputWrapper, { borderColor: colors.glass.border }]}>
                  <MaterialIcons name="book" size={20} color={colors.text.muted} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder={t('topics.add.placeholder')}
                    placeholderTextColor={colors.text.muted}
                    value={value}
                    onChangeText={onChangeText}
                    autoFocus
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                  />
                </View>

                {/* Buttons */}
                <View style={styles.buttons}>
                  <GlassButton
                    title={t('topics.add.cancel')}
                    onPress={onClose}
                    variant="ghost"
                    style={styles.button}
                  />
                  <GlassButton
                    title={t('topics.add.create')}
                    onPress={handleSubmit}
                    disabled={!value.trim()}
                    loading={isLoading}
                    style={styles.button}
                  />
                </View>
              </GlassView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modal: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading.h3,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    ...Typography.body.medium,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
