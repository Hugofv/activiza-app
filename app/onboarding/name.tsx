import { useState } from 'react';

import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { navigate } from 'expo-router/build/global-state/routing';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import { nameSchema } from '@/lib/validations/onboarding';

interface NameFormData {
  name: string;
}

/**
 * Name input screen for onboarding
 */
const NameScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: yupResolver(nameSchema),
    defaultValues: { name: formData.name || '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: NameFormData) => {
    // Update form data and save to API with step tracking (unified)
    setIsSubmitting(true);
    try {
      await updateFormData({ name: data.name }, 'name');
      navigate('/onboarding/contact');
    } catch (error: any) {
      console.error('Failed to save name step:', error);
      const apiMessage = getTranslatedError(
        (error?.response?.data as any) || error,
        t('onboarding.saveError') || 'Failed to save. Please try again.'
      );
      showError(t('common.error') || 'Error', apiMessage);
    } finally {
      setIsSubmitting(false);
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
              <Progress value={50} />
            </View>

            {/* Back Button */}
            <BackButton />

            {/* Title */}
            <Typography variant="h4">{t('onboarding.name')}</Typography>

            {/* Input Field */}
            <Input
              name="name"
              control={control}
              error={errors.name?.message}
              className="border-0 rounded-none px-0 py-4 font-medium"
              style={[
                {
                  fontSize: 24,
                  borderBottomColor: errors.name ? '#ef4444' : colors.icon,
                },
              ]}
              placeholder={t('onboarding.namePlaceholder')}
              placeholderTextColor={colors.icon}
              keyboardType="default"
              maxLength={100}
              autoFocus
            />
          </ThemedView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant="primary"
              size="md"
              icon="arrow-forward"
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              loading={isSubmitting}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NameScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: { marginBottom: 8 },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
