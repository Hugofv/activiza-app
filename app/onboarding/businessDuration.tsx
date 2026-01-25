import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { ListCheck } from '@/components/ui/ListCheck';
import { Progress } from '@/components/ui/Progress';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import { useTranslation } from 'react-i18next';

// Numeric values represent business duration in months
// 0 = unlimited/more than the highest range
const BUSINESS_DURATION_OPTIONS: {
  value: number; // Duration in months
  keyPt: string;
  keyEn: string;
}[] = [
  { value: 6, keyPt: 'businessDurationLessThan6Months', keyEn: 'businessDurationLessThan6Months' }, // Less than 6 months (max 6)
  { value: 12, keyPt: 'businessDuration6MonthsTo1Year', keyEn: 'businessDuration6MonthsTo1Year' }, // 6 months to 1 year (max 12)
  { value: 36, keyPt: 'businessDuration1To3Years', keyEn: 'businessDuration1To3Years' }, // 1 to 3 years (max 36 months)
  { value: 0, keyPt: 'businessDurationMoreThan3Years', keyEn: 'businessDurationMoreThan3Years' }, // 0 = unlimited/more than 3 years (36+ months)
];

/**
 * Business duration selection screen for onboarding
 */
const BusinessDurationScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedOption, setSelectedOption] = useState<number | null>(
    formData.businessDuration || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useToast();

  const handleContinue = async () => {
    if (selectedOption === null) return;

    // Update form data and save to API with step tracking (unified)
    setIsSubmitting(true);
    try {
      await updateFormData({ businessDuration: selectedOption }, 'business_duration');
      router.push('/onboarding/address');
    } catch (error: any) {
      console.error('Failed to save businessDuration step:', error);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.content}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Progress value={85} />
              </View>

              {/* Back Button */}
              <BackButton />

              {/* Title */}
              <Typography variant='h4' style={styles.title}>
                {t('onboarding.businessDuration')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                <ListCheck<number>
                  options={BUSINESS_DURATION_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(`onboarding.${option.keyPt}`),
                  }))}
                  selectedValue={selectedOption}
                  onValueChange={(value) => setSelectedOption(value as number)}
                />
              </View>
            </ThemedView>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='md'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleContinue}
              disabled={selectedOption === null}
              loading={isSubmitting}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BusinessDurationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  optionsList: {
    marginTop: 8,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
});
