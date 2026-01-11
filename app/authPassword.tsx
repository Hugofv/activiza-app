import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const onboardingStep = params.onboardingStep || '';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      Alert.alert('Error', 'Email is required');
      return;
    }

    setIsLoading(true);
    try {
      // Login user
      await login({
        email,
        password: data.password,
      });

      // After login, redirect based on onboardingStep from params
      // If user is fully registered (COMPLETED), onboardingStep will be empty and redirect to home
      // If user is in progress (IN_PROGRESS), onboardingStep will contain the step to continue
      if (onboardingStep) {
        // User is in progress onboarding, redirect to the step from params
        const stepToRouteMap: Record<string, string> = {
          // API step values -> route names (from API examples)
          phone_verification: '/onboarding/codeContact',
          active_customers: '/onboarding/activeCustomers',
          financial_operations: '/onboarding/financialOperations',
          working_capital: '/onboarding/capital',
          business_duration: '/onboarding/businessDuration',
          postal_code: '/onboarding/postalCode',
          address: '/onboarding/address',
          terms: '/onboarding/terms',
          // Additional possible steps
          email: '/onboarding/email',
          email_verification: '/onboarding/codeEmail',
          password: '/onboarding/password',
          document: '/onboarding/document',
          name: '/onboarding/name',
          contact: '/onboarding/contact',
          country: '/onboarding/country',
          options: '/onboarding/options',
        };
        const route = stepToRouteMap[onboardingStep] || '/onboarding/password';
        router.replace(route as any);
      } else {
        // User is fully registered (COMPLETED), redirect to home
        router.replace('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Authentication Failed',
        error?.message || 'Invalid email or password. Please try again.'
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
                iconLibrary='ionicons'
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
