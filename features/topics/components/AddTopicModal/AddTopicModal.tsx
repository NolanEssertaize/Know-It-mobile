/**
 * @file AddTopicModal.tsx
 * @description Modal pour ajouter un nouveau topic - Theme Aware + Null Safe + i18n
 *
 * MERGED:
 * - MAIN branch: All styles and component structure preserved
 * - i18nV2 branch: Translation hooks injected for all hardcoded strings
 *
 * FIXED:
 * - Added null safety for value prop (value?.trim())
 * - Now uses useTheme() for dynamic colors
 * - i18n translations for all user-facing strings
 */

import React, { memo } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AddTopicModalProps {
    visible: boolean;
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const AddTopicModal = memo(function AddTopicModal({
                                                             visible,
                                                             value,
                                                             onChangeText,
                                                             onSubmit,
                                                             onClose,
                                                         }: AddTopicModalProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();

    // FIX: Null safety - use empty string if value is undefined
    const safeValue = value ?? '';
    const isValid = safeValue.trim().length > 0;

    const handleSubmit = () => {
        if (isValid) {
            onSubmit();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable
                        style={[styles.content, { backgroundColor: colors.background.primary }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text.primary }]}>
                                {t('topics.add.title', 'Nouveau Sujet')}
                            </Text>
                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color={colors.text.secondary}
                                />
                            </Pressable>
                        </View>

                        {/* Input */}
                        <GlassView style={styles.inputContainer} showBorder>
                            <TextInput
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder={t('topics.add.placeholder', 'Nom du sujet (ex: React Hooks)')}
                                placeholderTextColor={colors.text.muted}
                                value={safeValue}
                                onChangeText={onChangeText}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />
                        </GlassView>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: colors.text.primary },
                                !isValid && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isValid}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.submitButtonText, { color: colors.text.inverse }]}>
                                {t('topics.add.create', 'Créer le sujet')}
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    closeButton: {
        padding: Spacing.xs,
    },
    inputContainer: {
        marginBottom: Spacing.lg,
    },
    input: {
        fontSize: 16,
        padding: Spacing.md,
    },
    submitButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddTopicModal;