import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { codeSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface CodeEmailFormData {
  code: string;
}

/**
 * Code verification screen for email onboarding
 */
const CodeEmailScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { updateFormData } = useOnboardingForm();
  const [resendTimer, setResendTimer] = useState(60);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CodeEmailFormData>({
    resolver: yupResolver(codeSchema),
    defaultValues: {
      code: '',
    },
    mode: 'onChange',
  });

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleBack = () => {
    router.back();
  };

  const onSubmit = (data: CodeEmailFormData) => {
    // TODO: Verify code with backend
    updateFormData({ emailCode: data.code });
    router.push('/onboarding/confirmEmail');
  };

  const handleResendCode = () => {
    // TODO: Resend code via email
    setResendTimer(60);
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
            <Button variant='secondary' size='iconSmall' onPress={handleBack}>
              <Icon name='chevron-back' size={32} color={colors.primary} />
            </Button>

            {/* Title */}
            <Typography variant='h4' style={styles.title}>
              {t('onboarding.emailCodeTitle')}
            </Typography>

            {/* Code Input */}
            <View style={styles.codeContainer}>
              <CodeInput
                name="code"
                control={control}
                error={errors.code?.message}
                length={6}
                autoFocus
              />
            </View>

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Typography variant='body2' style={{ color: colors.icon }}>
                  {t('onboarding.codeResendTimer', { seconds: resendTimer })}
                </Typography>
              ) : (
                <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
                  <Typography variant='body2' style={{ color: colors.primary }}>
                    {t('onboarding.codeResend')}
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant='primary'
              size='iconLarge'
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
            >
              <Icon
                name='arrow-forward'
                size={32}
                color={colors.primaryForeground}
              />
            </Button>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CodeEmailScreen;

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
  title: {
    marginTop: 8,
  },
  codeContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});

