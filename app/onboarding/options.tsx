import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { ListCheck } from '@/components/ui/list-check';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { getModules, Module } from '@/lib/services/onboardingService';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import { useTranslation } from 'react-i18next';

type BusinessOption = string;

/**
 * Map module keys to icon configuration
 * This maps the 'key' field from the API (UPPER_SNAKE_CASE) to the appropriate icon and library
 */
const MODULE_ICON_MAP: Record<
  string,
  { icon: string }
> = {
  LOAN: { icon: 'cash-outline' },
  PROMISSORY_NOTE: { icon: 'document-text-outline' },
  RENT_HOUSE: { icon: 'home' },
  RENT_ROOM: { icon: 'door-outline' },
  RENT_VEHICLE: { icon: 'car' },
  // Default fallback icon
  default: { icon: 'ellipse-outline' },
};

/**
 * Map API module keys (UPPER_SNAKE_CASE) to translation keys (camelCase)
 */
const MODULE_TRANSLATION_MAP: Record<string, string> = {
  LOAN: 'optionLendMoney',
  PROMISSORY_NOTE: 'optionPromissoryNotes',
  RENT_HOUSE: 'optionRentProperties',
  RENT_ROOM: 'optionRentRooms',
  RENT_VEHICLE: 'optionRentVehicles',
};

/**
 * Get icon configuration for a module key
 */
const getModuleIcon = (key: string) => {
  return MODULE_ICON_MAP[key] || MODULE_ICON_MAP.default;
};

/**
 * Get translation key for a module key
 */
const getModuleTranslationKey = (key: string): string => {
  return MODULE_TRANSLATION_MAP[key] || `option${key}`;
};

/**
 * Business options selection screen for onboarding
 */
const OptionsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const { showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch modules from API
  const {
    data: modules,
    isLoading: isLoadingModules,
    error: modulesError,
  } = useQuery<Module[]>({
    queryKey: ['modules'],
    queryFn: getModules,
    staleTime: 1000 * 60 * 60, // 1 hour - modules don't change frequently
  });

  // Initialize selected options from formData
  const [selectedOptions, setSelectedOptions] = useState<BusinessOption[]>(
    Array.isArray(formData.businessOptions)
      ? formData.businessOptions.filter((opt): opt is BusinessOption => typeof opt === 'string')
      : formData.businessOptions
        ? [formData.businessOptions as BusinessOption]
        : []
  );

  // Map modules to ListCheck options format
  const moduleOptions = useMemo(() => {
    if (!modules || !Array.isArray(modules) || modules.length === 0) return [];

    return modules.map((module) => {
      const iconConfig = getModuleIcon(module.key);
      const translationKey = getModuleTranslationKey(module.key);

      return {
        value: module.key,
        label: t(`onboarding.${translationKey}`) || module.name || module.key,
        leftContent: (
          <Icon
            name={iconConfig.icon as any}
            size={24}
            color={selectedOptions.includes(module.key) ? colors.primary : colors.icon}
          />
        ),
      };
    });
  }, [modules, selectedOptions, colors, t]);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (selectedOptions.length === 0) return;

    setIsSubmitting(true);
    try {
      // Save the options step and navigate to plans screen
      await updateFormData({ businessOptions: selectedOptions }, 'options');
      router.push('/onboarding/plans');
    } catch (error: any) {
      console.error('Failed to save options step:', error);
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
                {isLoadingModules ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={colors.primary} />
                    <Typography variant='body2' style={[styles.loadingText, { color: colors.icon }]}>
                      {t('common.loading') || 'Carregando...'}
                    </Typography>
                  </View>
                ) : modulesError ? (
                  <View style={styles.errorContainer}>
                    <Typography variant='body2' style={[styles.errorText, { color: colors.text }]}>
                      {t('common.error') || 'Erro ao carregar módulos'}
                    </Typography>
                  </View>
                ) : moduleOptions?.length > 0 ? (
                  <ListCheck<BusinessOption>
                    multiple
                    options={moduleOptions}
                    selectedValue={selectedOptions}
                    onValueChange={(value) => setSelectedOptions(value as BusinessOption[])}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Typography variant='body2' style={[styles.emptyText, { color: colors.icon }]}>
                      {t('common.noData') || 'Nenhum módulo disponível'}
                    </Typography>
                  </View>
                )}
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
              disabled={selectedOptions.length === 0 || isSubmitting}
              loading={isSubmitting}
            />
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
    alignItems: 'flex-end',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
