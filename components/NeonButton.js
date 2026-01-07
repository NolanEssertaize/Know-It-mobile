import { Pressable, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '../theme/theme';

export const NeonButton = ({ title, onPress, style }) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Feedback tactile
        onPress && onPress();
    };

    return (
        <View style={[styles.glowContainer, style]}>
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed
                ]}>
                <Text style={styles.text}>{title}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    glowContainer: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15, // L'effet Glow
        elevation: 10, // Android Glow (limité)
    },
    button: {
        backgroundColor: THEME.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: THEME.borderRadius.button,
        alignItems: 'center',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }]
    },
    text: {
        color: '#000', // Contraste max sur le cyan
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    }
});