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
import { IconButton } from '@/components/ui/icon-button';
import { ListCheck } from '@/components/ui/list-check';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

// Numeric values represent the maximum number of active customers
// 0 = unlimited/more than the highest range
const ACTIVE_CUSTOMERS_OPTIONS: {
  value: number; // Max number of customers
  keyPt: string;
  keyEn: string;
}[] = [
  { value: 20, keyPt: 'activeCustomersUpTo20', keyEn: 'activeCustomersUpTo20' },
  { value: 50, keyPt: 'activeCustomers21To50', keyEn: 'activeCustomers21To50' },
  { value: 100, keyPt: 'activeCustomers51To100', keyEn: 'activeCustomers51To100' },
  { value: 300, keyPt: 'activeCustomers101To300', keyEn: 'activeCustomers101To300' },
  { value: 0, keyPt: 'activeCustomersMoreThan300', keyEn: 'activeCustomersMoreThan300' }, // 0 = unlimited/more than 300
];

/**
 * Active customers selection screen for onboarding
 */
const ActiveCustomersScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedOption, setSelectedOption] = useState<number | null>(
    formData.activeCustomers || null
  );

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (selectedOption === null) return;

    updateFormData({ activeCustomers: selectedOption });
    router.push('/onboarding/financialOperations');
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
                <Progress value={40} />
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
                {t('onboarding.activeCustomers')}
              </Typography>

              {/* Description */}
              <Typography variant='body2' style={styles.description}>
                {t('onboarding.activeCustomersDescription')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                <ListCheck<number>
                  options={ACTIVE_CUSTOMERS_OPTIONS.map((option) => ({
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

export default ActiveCustomersScreen;

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
  description: {
    marginTop: -8,
    opacity: 0.7,
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
