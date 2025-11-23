import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { emailSchema } from '@/lib/validations/onboarding';

import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';

interface EmailFormData {
  email: string;
}

/**
 * Email input screen for onboarding
 */
const EmailScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      email: formData.email || '',
    },
    mode: 'onChange',
  });

  const handleBack = () => {
    router.back();
  };

  const onSubmit = (data: EmailFormData) => {
    updateFormData({ email: data.email });
    // Navigate to email code verification
    router.push('/onboarding/codeEmail');
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
              <Progress value={45} />
            </View>

            {/* Back Button */}
            <Button variant='secondary' size='iconSmall' onPress={handleBack}>
              <Icon name='chevron-back' size={32} color={colors.primary} />
            </Button>

            {/* Title */}
            <Typography variant='h4'>{t('onboarding.email')}</Typography>

            {/* Input Field */}
            <Input
              name="email"
              control={control}
              error={errors.email?.message}
              className='border-0 rounded-none px-0 py-4 font-medium'
              style={[
                { 
                  fontSize: 24,
                  borderBottomColor: errors.email ? '#ef4444' : colors.icon,
                },
              ]}
              placeholder={t('common.email')}
              placeholderTextColor={colors.icon}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect={false}
              maxLength={100}
              autoFocus
            />
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

export default EmailScreen;

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
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
