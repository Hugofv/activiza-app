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

// Numeric values represent the maximum operations per month
// 0 = unlimited/more than the highest range
const FINANCIAL_OPERATIONS_OPTIONS: {
  value: number; // Max operations per month
  keyPt: string;
  keyEn: string;
}[] = [
  { value: 5, keyPt: 'financialOperationsUpTo5', keyEn: 'financialOperationsUpTo5' },
  { value: 10, keyPt: 'financialOperations6To10', keyEn: 'financialOperations6To10' },
  { value: 20, keyPt: 'financialOperations11To20', keyEn: 'financialOperations11To20' },
  { value: 50, keyPt: 'financialOperations21To50', keyEn: 'financialOperations21To50' },
  { value: 100, keyPt: 'financialOperations51To100', keyEn: 'financialOperations51To100' },
  { value: 200, keyPt: 'financialOperations101To200', keyEn: 'financialOperations101To200' },
  { value: 0, keyPt: 'financialOperationsMoreThan200', keyEn: 'financialOperationsMoreThan200' }, // 0 = unlimited/more than 200
];

/**
 * Financial operations selection screen for onboarding
 */
const FinancialOperationsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedOption, setSelectedOption] = useState<number | null>(
    formData.financialOperations || null
  );

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (selectedOption === null) return;

    updateFormData({ financialOperations: selectedOption });
    router.push('/onboarding/email');
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
                <Progress value={45} />
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
                {t('onboarding.financialOperations')}
              </Typography>

              {/* Description */}
              <Typography variant='body2' style={styles.description}>
                {t('onboarding.financialOperationsDescription')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                <ListCheck<number>
                  options={FINANCIAL_OPERATIONS_OPTIONS.map((option) => ({
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

export default FinancialOperationsScreen;

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
