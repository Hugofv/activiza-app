import { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ListCheck } from '@/components/ui/ListCheck';
import { Progress } from '@/components/ui/Progress';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useModules } from '@/lib/hooks/useModules';
import {
  MODULE_ICON_MAP,
  MODULE_TRANSLATION_MAP,
} from '@/lib/constants/operationConstants';
import { useToast } from '@/lib/hooks/useToast';
import type { Module } from '@/lib/services/onboardingService';
import { getTranslatedError } from '@/lib/utils/errorTranslator';

type BusinessOption = string;

const getModuleIcon = (key: string) =>
  MODULE_ICON_MAP[key] ?? MODULE_ICON_MAP.default;

const getModuleTranslationKey = (key: string): string =>
  MODULE_TRANSLATION_MAP[key] ?? `option${key}`;

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

  const { data: modules, isLoading: isLoadingModules, error: modulesError } =
    useModules();

  // Initialize selected options from formData
  const [selectedOptions, setSelectedOptions] = useState<BusinessOption[]>(
    Array.isArray(formData.businessOptions)
      ? formData.businessOptions.filter(
          (opt): opt is BusinessOption => typeof opt === 'string'
        )
      : formData.businessOptions
        ? [formData.businessOptions as BusinessOption]
        : []
  );

  // Map modules to ListCheck options format
  const moduleOptions = useMemo(() => {
    if (!modules || !Array.isArray(modules) || modules.length === 0) return [];

    return modules.map((module) => {
      const translationKey = getModuleTranslationKey(module.key);
      return {
        value: module.key,
        label: t(`onboarding.${translationKey}`) || module.name || module.key,
        leftContent: (
          <Icon
            name={getModuleIcon(module.key) as any}
            size={24}
            color={selectedOptions.includes(module.key) ? 'primary' : 'icon'}
          />
        ),
      };
    });
  }, [modules, selectedOptions, t]);

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
              <BackButton />

              {/* Title */}
              <Typography
                variant="h4"
                style={styles.title}
              >
                {t('onboarding.whatDoYouWantToDo')}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                style={styles.description}
              >
                {t('onboarding.optionsDescription')}
              </Typography>

              {/* Options List */}
              <View style={styles.optionsList}>
                {isLoadingModules ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                    />
                    <Typography
                      variant="body2"
                      style={[styles.loadingText, { color: colors.icon }]}
                    >
                      {t('common.loading') || 'Carregando...'}
                    </Typography>
                  </View>
                ) : modulesError ? (
                  <View style={styles.errorContainer}>
                    <Typography
                      variant="body2"
                      style={[styles.errorText, { color: colors.text }]}
                    >
                      {t('common.error') || 'Erro ao carregar módulos'}
                    </Typography>
                  </View>
                ) : moduleOptions?.length > 0 ? (
                  <ListCheck<BusinessOption>
                    multiple
                    options={moduleOptions}
                    selectedValue={selectedOptions}
                    onValueChange={(value) =>
                      setSelectedOptions(value as BusinessOption[])
                    }
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Typography
                      variant="body2"
                      style={[styles.emptyText, { color: colors.icon }]}
                    >
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
              variant="primary"
              size="md"
              icon="arrow-forward"
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
  container: {flex: 1,},
  scrollView: {flex: 1,},
  scrollContent: {flexGrow: 1,},
  content: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  progressContainer: {marginBottom: 8,},
  title: {marginTop: 8,},
  description: {
    marginTop: -8,
    opacity: 0.7,
  },
  optionsList: {marginTop: 8,},
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
  loadingText: {marginTop: 8,},
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {textAlign: 'center',},
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {textAlign: 'center',},
});
