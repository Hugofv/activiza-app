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

// Numeric values represent working capital in actual currency units
// 0 = unlimited/more than the highest range
const WORKING_CAPITAL_OPTIONS: {
  value: number; // Working capital in actual currency units (e.g., 5000 = 5k, 100000 = 100k)
  keyPt: string;
  keyEn: string;
}[] = [
  { value: 5000, keyPt: 'workingCapitalUpTo5k', keyEn: 'workingCapitalUpTo5k' },
  { value: 20000, keyPt: 'workingCapital5kTo20k', keyEn: 'workingCapital5kTo20k' },
  { value: 50000, keyPt: 'workingCapital20kTo50k', keyEn: 'workingCapital20kTo50k' },
  { value: 100000, keyPt: 'workingCapital50kTo100k', keyEn: 'workingCapital50kTo100k' },
  { value: 0, keyPt: 'workingCapitalMoreThan100k', keyEn: 'workingCapitalMoreThan100k' }, // Represents "more than 100k"
];

/**
 * Working capital selection screen for onboarding
 */
const CapitalScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedOption, setSelectedOption] = useState<number | null>(
    formData.workingCapital || null
  );

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (selectedOption === null) return;

    updateFormData({ workingCapital: selectedOption });
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedView style={styles.content}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Progress value={70} />
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
                {t('onboarding.workingCapital')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                <ListCheck<number>
                  options={WORKING_CAPITAL_OPTIONS.map((option) => ({
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
              disabled={selectedOption === null}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CapitalScreen;

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
