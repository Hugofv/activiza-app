import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { passwordSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface PasswordFormData {
  password: string;
}

/**
 * Password creation screen for onboarding
 */
const PasswordScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { updateFormData } = useOnboardingForm();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const password = watch('password') || '';

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
  ];

  const handleBack = () => {
    router.back();
  };

  const onSubmit = (data: PasswordFormData) => {
    updateFormData({ password: data.password });
    router.push('/onboarding/country');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Progress value={54} />
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
                iconLibrary='ionicons'
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
                    library='ionicons'
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
              disabled={!isValid}
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
