import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { useToast } from '@/lib/hooks/useToast';
import { login } from '@/lib/services/authService';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

interface PasswordFormData {
  password: string;
}

const passwordSchema = yup.object({
  password: yup.string().required('Password is required'),
});

/**
 * Password authentication screen for existing users
 */
const AuthPasswordScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string; onboardingStep?: string }>();
  const email = params.email || '';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { redirectAfterAuth } = useAuthGuard();
  const { showError } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: PasswordFormData) => {
    if (!email) {
      showError(
        t('common.errors.MISSING_REQUIRED_FIELDS') || 'Email is required.',
        t('onboarding.email') || 'Email'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Login user
      await login({
        email,
        password: data.password,
      });

      // After login, delegate redirect (home vs onboarding) to centralized AuthGuard logic
      await redirectAfterAuth();
    } catch (error: any) {
      console.error('Login error:', error);
      showError(
        t('common.errors.INVALID_CREDENTIALS') || 'Authentication Failed',
        error?.message || t('common.errors.INVALID_CREDENTIALS') || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
            <IconButton
              variant='secondary'
              size='sm'
              icon='chevron-back'
              iconSize={32}
              iconColor={colors.primary}
              onPress={handleBack}
            />

            {/* Title */}
            <Typography variant='h4'>{t('onboarding.enterPassword')}</Typography>

            {/* Description */}
            <Typography
              variant='body2'
              style={[styles.description, { color: colors.icon }]}
            >
              {t('onboarding.enterPasswordDescription', { email })}
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
                autoComplete='password'
                autoCorrect={false}
                textContentType='password'
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to forgot password screen
                  Alert.alert('Forgot Password', 'Feature coming soon');
                }}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Typography
                  variant='body2'
                  style={[styles.forgotPasswordText, { color: colors.primary }]}
                >
                  {t('onboarding.forgotPassword')}
                </Typography>
              </TouchableOpacity>
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
              disabled={!isValid || isLoading}
              loading={isLoading}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthPasswordScreen;

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
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  forgotPasswordContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
