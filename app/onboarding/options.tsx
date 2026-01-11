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
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { ListCheck } from '@/components/ui/list-check';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

type BusinessOption =
  | 'lendMoney'
  | 'promissoryNotes'
  | 'rentProperties'
  | 'rentRooms'
  | 'rentVehicles';

const BUSINESS_OPTIONS: {
  value: BusinessOption;
  keyPt: string;
  keyEn: string;
  icon: string;
  iconLibrary?: 'ionicons' | 'material' | 'feather' | 'fontawesome' | 'antdesign';
}[] = [
  { 
    value: 'lendMoney', 
    keyPt: 'optionLendMoney', 
    keyEn: 'optionLendMoney',
    icon: 'cash-outline',
    iconLibrary: 'ionicons',
  },
  { 
    value: 'promissoryNotes', 
    keyPt: 'optionPromissoryNotes', 
    keyEn: 'optionPromissoryNotes',
    icon: 'document-text-outline',
    iconLibrary: 'ionicons',
  },
  { 
    value: 'rentProperties', 
    keyPt: 'optionRentProperties', 
    keyEn: 'optionRentProperties',
    icon: 'home-outline',
    iconLibrary: 'ionicons',
  },
  { 
    value: 'rentRooms', 
    keyPt: 'optionRentRooms', 
    keyEn: 'optionRentRooms',
    icon: 'door-outline',
    iconLibrary: 'ionicons',
  },
  { 
    value: 'rentVehicles', 
    keyPt: 'optionRentVehicles', 
    keyEn: 'optionRentVehicles',
    icon: 'car-outline',
    iconLibrary: 'ionicons',
  },
];

/**
 * Business options selection screen for onboarding
 */
const OptionsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [selectedOptions, setSelectedOptions] = useState<BusinessOption[]>(
    Array.isArray(formData.businessOptions)
      ? formData.businessOptions.filter((opt): opt is BusinessOption =>
          typeof opt === 'string' &&
          ['lendMoney', 'promissoryNotes', 'rentProperties', 'rentRooms', 'rentVehicles'].includes(opt)
        )
      : formData.businessOptions
        ? [formData.businessOptions as BusinessOption]
        : []
  );

  const handleBack = () => {
    router.back();
  };

  const handleFinish = async () => {
    if (selectedOptions.length === 0) return;

    // Update form data and save to API with step tracking (unified)
    try {
      await updateFormData({ businessOptions: selectedOptions }, 'options');
      router.push('/onboarding/registerFinished');
    } catch (error) {
      // Don't block navigation if save fails (offline mode will queue it)
      console.warn('Failed to save options step, will retry:', error);
      router.push('/onboarding/registerFinished');
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
                <Progress value={99} />
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
                {t('onboarding.whatDoYouWantToDo')}
              </Typography>

              {/* Description */}
              <Typography variant='body2' style={styles.description}>
                {t('onboarding.optionsDescription')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                <ListCheck<BusinessOption>
                  multiple
                  options={BUSINESS_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(`onboarding.${option.keyPt}`),
                    leftContent: (
                      <Icon
                        name={option.icon as any}
                        library={option.iconLibrary || 'ionicons'}
                        size={24}
                        color={selectedOptions.includes(option.value) ? colors.primary : colors.icon}
                      />
                    ),
                  }))}
                  selectedValue={selectedOptions}
                  onValueChange={(value) => setSelectedOptions(value as BusinessOption[])}
                />
              </View>
            </ThemedView>
          </ScrollView>

          {/* Finish Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant='primary'
              size='full'
              onPress={handleFinish}
              disabled={selectedOptions.length === 0}
            >
              {t('onboarding.finish')}
            </Button>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OptionsScreen;

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
    paddingTop: 16,
  },
});
