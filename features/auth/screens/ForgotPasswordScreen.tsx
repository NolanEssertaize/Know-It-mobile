/**
 * @file ForgotPasswordScreen.tsx
 * @description 3-step forgot password wizard with animated transitions
 */

import React, { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, ArrowLeft, Check, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { validatePassword, isPasswordValid } from '@/features/auth/utils/passwordValidation';
import { useTheme, Spacing, BorderRadius, FontSize } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

const StepIndicator = memo(function StepIndicator({
  currentStep,
  labels,
}: {
  currentStep: number;
  labels: string[];
}) {
  const { colors } = useTheme();
  const animValues = useRef(labels.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animValues.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i <= currentStep ? 1 : 0,
        tension: 50,
        friction: 8,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStep, animValues]);

  return (
    <View style={stepStyles.container}>
      {labels.map((label, i) => {
        const dotWidth = animValues[i].interpolate({
          inputRange: [0, 1],
          outputRange: [8, 24],
        });
        const dotOpacity = animValues[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        return (
          <View key={i} style={stepStyles.stepItem}>
            <Animated.View
              style={[
                stepStyles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: colors.text.primary,
                },
              ]}
            />
            <Text
              style={[
                stepStyles.label,
                {
                  color: i <= currentStep ? colors.text.primary : colors.text.muted,
                  fontWeight: i === currentStep ? '600' : '400',
                },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: FontSize.xs,
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// TOAST BANNER
// ═══════════════════════════════════════════════════════════════════════════

const ToastBanner = memo(function ToastBanner({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, { toValue: -50, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, translateY, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        toastStyles.container,
        {
          backgroundColor: colors.surface.glass,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Check size={16} color={colors.text.primary} />
      <Text style={[toastStyles.text, { color: colors.text.primary }]}>{message}</Text>
    </Animated.View>
  );
});

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: EMAIL
// ═══════════════════════════════════════════════════════════════════════════

const Step1Email = memo(function Step1Email({
  email,
  setEmail,
  onSubmit,
  isLoading,
  error,
  t,
}: {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  t: (key: string) => string;
}) {
  const { colors } = useTheme();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const errorMessage = error === 'RATE_LIMITED'
    ? t('auth.forgotPassword.rateLimited')
    : error === 'NETWORK_ERROR'
      ? t('auth.forgotPassword.networkError')
      : error;

  return (
    <View>
      <GlassInput
        label={t('auth.forgotPassword.emailLabel')}
        placeholder={t('auth.forgotPassword.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        leftIcon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        editable={!isLoading}
      />

      {errorMessage && (
        <View style={[sharedStyles.errorContainer, { backgroundColor: colors.surface.glass }]}>
          <Text style={[sharedStyles.errorText, { color: colors.text.primary }]}>{errorMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={isLoading || !isValidEmail}
        activeOpacity={0.8}
      >
        <View
          style={[
            sharedStyles.button,
            {
              backgroundColor: isLoading || !isValidEmail
                ? colors.surface.glass
                : colors.text.primary,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text.primary} />
          ) : (
            <Text style={[sharedStyles.buttonText, { color: colors.text.inverse }]}>
              {t('auth.forgotPassword.sendCode')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: OTP VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local.charAt(0) + '***';
  return `${masked}@${domain}`;
}

const OTPInput = memo(function OTPInput({
  onCodeComplete,
  hasError,
  clearTrigger,
}: {
  onCodeComplete: (code: string) => void;
  hasError: boolean;
  clearTrigger: number;
}) {
  const { colors } = useTheme();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const focusAnims = useRef([0, 1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Shake on error
  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      });
    }
  }, [hasError, clearTrigger, shakeAnim]);

  // Focus scale animation
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    Animated.spring(focusAnims[index], {
      toValue: 1.08,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [focusAnims]);

  const handleBlur = useCallback((index: number) => {
    setFocusedIndex(null);
    Animated.spring(focusAnims[index], {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [focusAnims]);

  const handleChange = useCallback((text: string, index: number) => {
    // Handle paste of full code
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
        const newDigits = pasted.split('');
        setDigits(newDigits);
        inputRefs.current[5]?.blur();
        onCodeComplete(pasted);
        return;
      }
    }

    const digit = text.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const newDigits = [...prev];
      newDigits[index] = digit;

      // Auto-submit when all filled
      if (digit && index === 5) {
        const code = newDigits.join('');
        if (code.length === 6) {
          setTimeout(() => onCodeComplete(code), 50);
        }
      }

      return newDigits;
    });

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [onCodeComplete]);

  const handleKeyPress = useCallback((e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigits((prev) => {
        const newDigits = [...prev];
        newDigits[index - 1] = '';
        return newDigits;
      });
    }
  }, [digits]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  return (
    <Animated.View style={[otpStyles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {digits.map((digit, i) => (
        <Animated.View
          key={i}
          style={[
            otpStyles.boxWrapper,
            { transform: [{ scale: focusAnims[i] }] },
          ]}
        >
          <TextInput
            ref={(ref) => { inputRefs.current[i] = ref; }}
            style={[
              otpStyles.box,
              {
                backgroundColor: colors.surface.glass,
                color: colors.text.primary,
                borderColor: focusedIndex === i
                  ? colors.text.primary
                  : colors.glass.border,
              },
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => handleFocus(i)}
            onBlur={() => handleBlur(i)}
            keyboardType="number-pad"
            maxLength={i === 0 ? 6 : 1}
            selectTextOnFocus
            textContentType="oneTimeCode"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
});

const otpStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  boxWrapper: {},
  box: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});

const Step2OTP = memo(function Step2OTP({
  email,
  onVerify,
  onResend,
  resendCooldown,
  isLoading,
  error,
  attemptsRemaining,
  t,
}: {
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  resendCooldown: number;
  isLoading: boolean;
  error: string | null;
  attemptsRemaining: number | null;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const { colors } = useTheme();
  const [errorClearTrigger, setErrorClearTrigger] = useState(0);

  const hasOTPError = error === 'INVALID_CODE';

  useEffect(() => {
    if (hasOTPError) {
      setErrorClearTrigger((prev) => prev + 1);
    }
  }, [hasOTPError]);

  const errorMessage = error === 'RATE_LIMITED'
    ? t('auth.forgotPassword.rateLimited')
    : error === 'NETWORK_ERROR'
      ? t('auth.forgotPassword.networkError')
      : error === 'INVALID_CODE'
        ? attemptsRemaining != null
          ? `${t('auth.forgotPassword.invalidCode')}. ${t('auth.forgotPassword.attemptsRemaining', { count: attemptsRemaining })}`
          : t('auth.forgotPassword.invalidCode')
        : error;

  return (
    <View>
      <Text style={[s2Styles.emailHint, { color: colors.text.secondary }]}>
        {t('auth.forgotPassword.codeSentTo', { email: maskEmail(email) })}
      </Text>

      <OTPInput
        onCodeComplete={onVerify}
        hasError={hasOTPError}
        clearTrigger={errorClearTrigger}
      />

      {errorMessage && (
        <View style={[sharedStyles.errorContainer, { backgroundColor: colors.surface.glass }]}>
          <Text style={[sharedStyles.errorText, { color: colors.text.primary }]}>{errorMessage}</Text>
        </View>
      )}

      {isLoading && (
        <ActivityIndicator size="small" color={colors.text.primary} style={{ marginBottom: Spacing.md }} />
      )}

      {/* Resend link */}
      <View style={s2Styles.resendContainer}>
        {resendCooldown > 0 ? (
          <Text style={[s2Styles.resendDisabled, { color: colors.text.muted }]}>
            {t('auth.forgotPassword.resendIn', { seconds: resendCooldown })}
          </Text>
        ) : (
          <TouchableOpacity onPress={onResend} disabled={isLoading}>
            <Text style={[s2Styles.resendLink, { color: colors.text.primary }]}>
              {t('auth.forgotPassword.resendCode')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
});

const s2Styles = StyleSheet.create({
  emailHint: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resendDisabled: {
    fontSize: FontSize.sm,
  },
  resendLink: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: RESET PASSWORD
// ═══════════════════════════════════════════════════════════════════════════

const RequirementRow = memo(function RequirementRow({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(met ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: met ? 1 : 0,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [met, scaleAnim]);

  return (
    <View style={reqStyles.row}>
      <Animated.View
        style={[
          reqStyles.checkContainer,
          {
            backgroundColor: met ? '#22C55E' : 'transparent',
            borderColor: met ? '#22C55E' : colors.text.muted,
            transform: [{ scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          },
        ]}
      >
        {met && <Check size={12} color="#FFFFFF" />}
      </Animated.View>
      <Text
        style={[
          reqStyles.label,
          { color: met ? colors.text.primary : colors.text.muted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const reqStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  checkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.sm,
  },
});

// Success overlay with animated checkmark
const SuccessOverlay = memo(function SuccessOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message: string;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[successStyles.overlay, { opacity: opacityAnim }]}>
      <Animated.View
        style={[
          successStyles.checkCircle,
          {
            backgroundColor: '#22C55E',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Check size={48} color="#FFFFFF" />
      </Animated.View>
      <Animated.Text
        style={[
          successStyles.message,
          {
            color: colors.text.primary,
            opacity: opacityAnim,
          },
        ]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
});

const successStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  message: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
});

const Step3Reset = memo(function Step3Reset({
  onSubmit,
  isLoading,
  error,
  isSuccess,
  onRestart,
  t,
}: {
  onSubmit: (password: string) => void;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  onRestart: () => void;
  t: (key: string) => string;
}) {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const confirmRef = useRef<TextInput>(null);

  const requirements = useMemo(() => validatePassword(password), [password]);
  const allMet = isPasswordValid(requirements);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allMet && passwordsMatch && !isLoading;

  const errorMessage = error === 'TOKEN_EXPIRED'
    ? t('auth.forgotPassword.tokenExpired')
    : error === 'RATE_LIMITED'
      ? t('auth.forgotPassword.rateLimited')
      : error === 'NETWORK_ERROR'
        ? t('auth.forgotPassword.networkError')
        : error;

  const isTokenExpired = error === 'TOKEN_EXPIRED';

  return (
    <View style={{ position: 'relative', minHeight: 400 }}>
      <SuccessOverlay visible={isSuccess} message={t('auth.forgotPassword.resetSuccess')} />

      {!isSuccess && (
        <>
          <GlassInput
            label={t('auth.forgotPassword.newPassword')}
            placeholder={t('auth.forgotPassword.newPasswordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            isPassword
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            editable={!isLoading}
          />

          <GlassInput
            ref={confirmRef}
            label={t('auth.forgotPassword.confirmPassword')}
            placeholder={t('auth.forgotPassword.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            returnKeyType="done"
            onSubmitEditing={() => canSubmit && onSubmit(password)}
            editable={!isLoading}
            error={
              confirmPassword.length > 0 && !passwordsMatch
                ? t('auth.forgotPassword.passwordsMustMatch')
                : undefined
            }
          />

          {/* Requirements checklist */}
          <View style={s3Styles.requirements}>
            <RequirementRow met={requirements.minLength} label={t('auth.forgotPassword.requirements.minLength')} />
            <RequirementRow met={requirements.hasUppercase} label={t('auth.forgotPassword.requirements.uppercase')} />
            <RequirementRow met={requirements.hasLowercase} label={t('auth.forgotPassword.requirements.lowercase')} />
            <RequirementRow met={requirements.hasDigit} label={t('auth.forgotPassword.requirements.digit')} />
          </View>

          {errorMessage && (
            <View style={[sharedStyles.errorContainer, { backgroundColor: colors.surface.glass }]}>
              <Text style={[sharedStyles.errorText, { color: colors.text.primary }]}>{errorMessage}</Text>
            </View>
          )}

          {isTokenExpired ? (
            <TouchableOpacity onPress={onRestart} activeOpacity={0.8}>
              <View style={[sharedStyles.button, { backgroundColor: colors.text.primary }]}>
                <Text style={[sharedStyles.buttonText, { color: colors.text.inverse }]}>
                  {t('auth.forgotPassword.restartFlow')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onSubmit(password)}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              <View
                style={[
                  sharedStyles.button,
                  {
                    backgroundColor: canSubmit ? colors.text.primary : colors.surface.glass,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.text.primary} />
                ) : (
                  <Text style={[sharedStyles.buttonText, { color: colors.text.inverse }]}>
                    {t('auth.forgotPassword.resetButton')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
});

const s3Styles = StyleSheet.create({
  requirements: {
    marginBottom: Spacing.lg,
    paddingLeft: Spacing.xs,
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════

export const ForgotPasswordScreen = memo(function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const {
    step,
    goToStep,
    email,
    setEmail,
    sendCode,
    verifyCode,
    resendCode,
    resendCooldown,
    attemptsRemaining,
    resetPassword,
    isLoading,
    error,
    clearError,
    isSuccess,
    restartFlow,
  } = useForgotPassword(params.email || '');

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevStepRef = useRef(step);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (step !== prevStepRef.current) {
      const goingForward = step > prevStepRef.current;

      // Show toast when advancing from step 0 to 1
      if (step === 1 && prevStepRef.current === 0) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
      }

      slideAnim.setValue(goingForward ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }).start();

      prevStepRef.current = step;
    }
  }, [step, slideAnim]);

  // Auto-navigate to login after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleBack = useCallback(() => {
    clearError();
    if (step === 0) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(auth)/login');
      }
    } else {
      goToStep((step - 1) as 0 | 1);
    }
  }, [step, router, goToStep, clearError]);

  const stepLabels = [
    t('auth.forgotPassword.stepEmail'),
    t('auth.forgotPassword.stepCode'),
    t('auth.forgotPassword.stepPassword'),
  ];

  const subtitles: Record<number, string> = {
    0: t('auth.forgotPassword.subtitle'),
    1: t('auth.forgotPassword.verifySubtitle'),
    2: t('auth.forgotPassword.resetSubtitle'),
  };

  const titles: Record<number, string> = {
    0: t('auth.forgotPassword.title'),
    1: t('auth.forgotPassword.verifyTitle'),
    2: t('auth.forgotPassword.resetTitle'),
  };

  return (
    <AuthLayout
      title={titles[step]}
      subtitle={subtitles[step]}
      footer={
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <View style={mainStyles.footerBack}>
            <ChevronLeft size={16} color={colors.text.secondary} />
            <Text style={[mainStyles.footerText, { color: colors.text.secondary }]}>
              {step === 0 ? t('auth.forgotPassword.backToLogin') : t('common.back')}
            </Text>
          </View>
        </TouchableOpacity>
      }
    >
      <StepIndicator currentStep={step} labels={stepLabels} />

      <ToastBanner
        message={t('auth.forgotPassword.codeSent')}
        visible={showToast}
      />

      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        {step === 0 && (
          <Step1Email
            email={email}
            setEmail={setEmail}
            onSubmit={sendCode}
            isLoading={isLoading}
            error={error}
            t={t}
          />
        )}

        {step === 1 && (
          <Step2OTP
            email={email}
            onVerify={verifyCode}
            onResend={resendCode}
            resendCooldown={resendCooldown}
            isLoading={isLoading}
            error={error}
            attemptsRemaining={attemptsRemaining}
            t={t}
          />
        )}

        {step === 2 && (
          <Step3Reset
            onSubmit={resetPassword}
            isLoading={isLoading}
            error={error}
            isSuccess={isSuccess}
            onRestart={restartFlow}
            t={t}
          />
        )}
      </Animated.View>
    </AuthLayout>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════════════

const sharedStyles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

const mainStyles = StyleSheet.create({
  footerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
