import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { register } from '@/lib/services/authService';
import { passwordSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface PasswordFormData {
  password: string;
  confirmPassword: string;
}

/**
 * Password creation screen for onboarding
 */
const PasswordScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const params = useLocalSearchParams<{ email?: string }>();
  const emailFromParams = typeof params.email === 'string' ? params.email : undefined;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
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

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: PasswordFormData) => {
    const effectiveEmail = formData.email || emailFromParams;

    if (!effectiveEmail) {
      Alert.alert('Error', 'Email is required. Please go back to email screen.');
      return;
    }

    // Ensure email is persisted in onboarding form data for subsequent steps
    if (!formData.email && emailFromParams) {
      await updateFormData({ email: emailFromParams });
    }

    setIsRegistering(true);
    try {
      // Register user with email and password (this creates the account and authenticates automatically)
      // The register() function already:
      // - Creates the user account
      // - Stores tokens securely
      // - Updates React Query cache with user data
      // - User is now authenticated
      await register({
        email: effectiveEmail,
        password: data.password,
      });

      // Continue to next step (email verification)
      // User is now authenticated, so onboarding routes are accessible
      console.log('📧 Calling updateStep for email_verification...');
      router.push('/onboarding/codeEmail');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsRegistering(false);
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
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={20} />
            </View>

            {/* Back Button */}
            <IconButton
              variant='secondary'
              size='sm'
              icon='chevron-back'
              iconSize={32}
              iconColor={colors.primary}
              onPress={handleBack}
            />

            {/* Title */}
            <Typography variant='h4'>{t('onboarding.password')}</Typography>

            {/* Description */}
            <Typography
              variant='body2'
              style={[styles.description, { color: colors.icon }]}
            >
              {t('onboarding.passwordDescription')}
            </Typography>

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
              />
            </View>

            {/* Password Rules List */}
            <View style={styles.rulesContainer}>
              {passwordRules.map((rule) => (
                <View key={rule.key} style={styles.ruleItem}>
                  <Icon
                    name={rule.isValid ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={rule.isValid ? '#10b981' : '#ef4444'}
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
              size='lg'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isRegistering}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PasswordScreen;

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
  progressContainer: {
    marginBottom: 8,
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
});
