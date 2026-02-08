/**
 * @file EditTopicModal.tsx
 * @description Modal pour modifier le nom d'un topic - Theme Aware
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface EditTopicModalProps {
    visible: boolean;
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const EditTopicModal = memo(function EditTopicModal({
    visible,
    value,
    onChangeText,
    onSubmit,
    onClose,
}: EditTopicModalProps) {
    const { colors } = useTheme();

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
                                Renommer le sujet
                            </Text>
                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color={colors.text.secondary}
                                />
                            </Pressable>
                        </View>

                        {/* Warning */}
                        <View style={[styles.warningContainer, { backgroundColor: colors.accent.warning + '20' }]}>
                            <MaterialIcons name="warning" size={18} color={colors.accent.warning} />
                            <Text style={[styles.warningText, { color: colors.text.secondary }]}>
                                Les sessions existantes garderont l'ancien nom, ce qui peut porter à confusion. Si ce n'est pas une correction, créez plutôt un nouveau sujet.
                            </Text>
                        </View>

                        {/* Input */}
                        <GlassView style={styles.inputContainer} showBorder>
                            <TextInput
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder="Nouveau nom du sujet"
                                placeholderTextColor={colors.text.muted}
                                value={safeValue}
                                onChangeText={onChangeText}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                                selectTextOnFocus
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
                                Enregistrer
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
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
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
