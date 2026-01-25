import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { requestPasswordReset } from '@/lib/services/authService';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import { emailSchema } from '@/lib/validations/onboarding';
import { navigate } from 'expo-router/build/global-state/routing';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordFormData {
  email: string;
}

/**
 * Forgot password screen - request password reset
 */
const ForgotPasswordScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string }>();
  const emailFromParams = typeof params.email === 'string' ? params.email : '';
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      email: emailFromParams,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      showSuccess(
        t('auth.forgotPasswordSuccess') || 'Success',
        t('auth.forgotPasswordSuccessMessage', { email: data.email }) ||
        `A password reset link has been sent to ${data.email}. Please check your email and click on the link to reset your password.`
      );
      // Navigate back to login - user will click the link in email
      navigate('/auth/email');
    } catch (error: any) {
      console.error('Request password reset error:', error);
      const apiMessage = getTranslatedError(
        (error?.response?.data as any) || error,
        t('auth.forgotPasswordError') || 'Failed to send reset link. Please try again.'
      );
      showError(t('common.error') || 'Error', apiMessage);
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
            <BackButton />

            {/* Title */}
            <Typography variant='h4'>{t('auth.forgotPassword') || 'Forgot Password'}</Typography>

            {/* Description */}
            <Typography
              variant='body2'
              style={[styles.description, { color: colors.icon }]}
            >
              {t('auth.forgotPasswordDescription') ||
                'Enter your email address and we will send you a code to reset your password.'}
            </Typography>

            {/* Email Input Field */}
            <View style={styles.inputContainer}>
              <Input
                name='email'
                control={control}
                error={errors.email?.message}
                label={t('common.email')}
                className='border-0 rounded-none px-0 py-4 font-medium'
                style={{ fontSize: 20 }}
                placeholder={t('auth.emailPlaceholder') || 'Enter your email'}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                autoCorrect={false}
                textContentType='emailAddress'
                disabled={isLoading}
              />
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
              disabled={!isValid || isLoading}
              loading={isLoading}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
    marginTop: 8,
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
});
