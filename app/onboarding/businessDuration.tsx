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

import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { ListCheck } from '@/components/ui/list-check';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

type BusinessDurationOption =
  | 'lessThan6Months'
  | '6MonthsTo1Year'
  | '1To3Years'
  | 'moreThan3Years';

const BUSINESS_DURATION_OPTIONS: {
  value: BusinessDurationOption;
  keyPt: string;
  keyEn: string;
}[] = [
  { value: 'lessThan6Months', keyPt: 'businessDurationLessThan6Months', keyEn: 'businessDurationLessThan6Months' },
  { value: '6MonthsTo1Year', keyPt: 'businessDuration6MonthsTo1Year', keyEn: 'businessDuration6MonthsTo1Year' },
  { value: '1To3Years', keyPt: 'businessDuration1To3Years', keyEn: 'businessDuration1To3Years' },
  { value: 'moreThan3Years', keyPt: 'businessDurationMoreThan3Years', keyEn: 'businessDurationMoreThan3Years' },
];

/**
 * Business duration selection screen for onboarding
 */
const BusinessDurationScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedOption, setSelectedOption] = useState<BusinessDurationOption | null>(
    (formData.businessDuration as BusinessDurationOption) || null
  );

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!selectedOption) return;

    updateFormData({ businessDuration: selectedOption });
    router.push('/onboarding/password');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
                <Progress value={60} />
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
              <Typography variant='h4' style={styles.title}>
                {t('onboarding.businessDuration')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                <ListCheck<BusinessDurationOption>
                  options={BUSINESS_DURATION_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(`onboarding.${option.keyPt}`),
                  }))}
                  selectedValue={selectedOption}
                  onValueChange={(value) => setSelectedOption(value)}
                />
              </View>
            </ThemedView>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <IconButton
              variant='primary'
              size='lg'
              icon='arrow-forward'
              iconSize={32}
              iconColor={colors.primaryForeground}
              onPress={handleContinue}
              disabled={!selectedOption}
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
