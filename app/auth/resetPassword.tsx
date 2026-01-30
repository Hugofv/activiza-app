import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { resetPassword } from '@/lib/services/authService';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import { passwordSchema } from '@/lib/validations/onboarding';
import { navigate } from 'expo-router/build/global-state/routing';
import { useTranslation } from 'react-i18next';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

/**
 * Reset password screen - set new password
 */
const ResetPasswordScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token || '';
  const { showError, showSuccess } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  // Password validation rules
  const passwordRules = [
    {
      key: 'minLength',
      label: t('onboarding.passwordRuleMinLength'),
      isValid: password.length >= 8,
    },
    {
      key: 'uppercase',
      label: t('onboarding.passwordRuleUppercase'),
      isValid: /[A-Z]/.test(password),
    },
    {
      key: 'lowercase',
      label: t('onboarding.passwordRuleLowercase'),
      isValid: /[a-z]/.test(password),
    },
    {
      key: 'number',
      label: t('onboarding.passwordRuleNumber'),
      isValid: /[0-9]/.test(password),
    },
    {
      key: 'special',
      label: t('onboarding.passwordRuleSpecial'),
      isValid: /[^A-Za-z0-9]/.test(password),
    },
    {
      key: 'match',
      label: t('onboarding.passwordRuleMatch'),
      isValid:
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword,
    },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showError(
        t('common.error') || 'Error',
        t('auth.invalidToken') || 'Invalid or missing reset token. Please use the link from your email.'
      );
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(token, data.password);
      showSuccess(
        t('auth.passwordResetSuccess') || 'Success',
        t('auth.passwordResetSuccessMessage') ||
        'Your password has been reset successfully. You can now login with your new password.'
      );
      // Navigate to login
      navigate('/auth/email');
    } catch (error: any) {
      console.error('Reset password error:', error);
      const apiMessage = getTranslatedError(
        (error?.response?.data as any) || error,
        t('auth.passwordResetError') || 'Failed to reset password. Please try again.'
      );
      showError(t('common.error') || 'Error', apiMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Back Button */}
            <BackButton />

            {/* Title */}
            <Typography variant='h4'>
              {t('auth.resetPassword') || 'Reset Password'}
            </Typography>

            {/* Description */}
            <Typography
              variant='body2'
              style={[styles.description, { color: colors.icon }]}
            >
              {t('auth.resetPasswordDescription') ||
                'Enter your new password below.'}
            </Typography>

            {/* Token validation message */}
            {!token && (
              <Typography
                variant='body2'
                style={[styles.errorText, { color: colors.error }]}
              >
                {t('auth.invalidToken') ||
                  'Invalid or missing reset token. Please use the link from your email.'}
              </Typography>
            )}

            {/* Password Input Field */}
            <View style={styles.inputContainer}>
              <Input
                name='password'
                control={control}
                error={errors.password?.message}
                label={t('common.password')}
                className='border-0 rounded-none px-0 py-4 font-medium'
                style={{ fontSize: 20, paddingRight: 50 }}
                placeholder={t('onboarding.passwordPlaceholder')}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                autoComplete='password-new'
                autoCorrect={false}
                textContentType='newPassword'
                disabled={isResetting}
              />

              {/* Show/Hide Password Button */}
              <IconButton
                variant='ghost'
                size='sm'
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                iconSize={24}
                iconColor={colors.icon}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isResetting}
              />
            </View>

            {/* Confirm Password Input Field */}
            <View style={styles.inputContainer}>
              <Input
                name='confirmPassword'
                control={control}
                error={errors.confirmPassword?.message}
                label={t('common.confirmPassword')}
                className='border-0 rounded-none px-0 py-4 font-medium'
                style={{ fontSize: 20, paddingRight: 50 }}
                placeholder={t('onboarding.confirmPasswordPlaceholder')}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
                autoComplete='password-new'
                autoCorrect={false}
                textContentType='newPassword'
                disabled={isResetting}
              />

              {/* Show/Hide Password Button */}
              <IconButton
                variant='ghost'
                size='sm'
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                iconSize={24}
                iconColor={colors.icon}
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isResetting}
              />
            </View>

            {/* Password Rules List */}
            <View style={styles.rulesContainer}>
              {passwordRules.map((rule) => (
                <View key={rule.key} style={styles.ruleItem}>
                  <Icon
                    name={rule.isValid ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={rule.isValid ? 'successForeground' : 'error'}
                  />
                  <Typography
                    variant='body2'
                    style={[
                      styles.ruleText,
                      {
                        color: rule.isValid ? '#10b981' : colors.icon,
                      },
                    ]}
                  >
                    {rule.label}
                  </Typography>
                </View>
              ))}
            </View>
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='md'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isResetting || !token}
              loading={isResetting}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  inputContainer: {
    position: 'relative',
    marginTop: 8,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 50,
    zIndex: 1,
    padding: 8,
  },
  buttonContainer: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  rulesContainer: {
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
});
