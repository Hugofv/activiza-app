import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Autocomplete, type AutocompleteOption } from '@/components/ui/Autocomplete';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type DocumentType,
  detectDocumentType,
  formatDocument as formatDocumentValue,
  getAllDocumentTypes,
  getDefaultDocumentTypeForCountry,
  getDocumentFormat,
  normalizeDocument,
} from '@/lib/services/documentService';
import type { CountryCode } from '@/lib/services/postalCodeService';
import { detectCountryFromLocale } from '@/lib/utils/geolocation';
import { createDocumentSchema } from '@/lib/validations/onboarding';

import { Typography } from '@/components/ui/Typography';
import { useToast } from '@/lib/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface DocumentFormData {
  document?: string;
  documentType?: DocumentType;
}

/**
 * Document input screen for onboarding
 * Document is now optional and simplified - only formatting based on country/type
 */
const DocumentScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, updateFormData } = useOnboardingForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useToast();

  // Memoize country detection (only runs once)
  const detectedCountry = useMemo(() => detectCountryFromLocale(), []);
  const countryCode: CountryCode = useMemo(
    () => (formData.address?.countryCode as CountryCode) || detectedCountry,
    [formData.address?.countryCode, detectedCountry]
  );

  const [documentType, setDocumentType] = useState<DocumentType | undefined>(
    (formData.documentType as DocumentType) || undefined
  );

  // Memoize document types (static array, but prevents recreation)
  const documentTypes = useMemo(() => getAllDocumentTypes(), []);

  // Memoize format config (only recalculates when country or type changes)
  const formatConfig = useMemo(
    () => getDocumentFormat(countryCode, documentType),
    [countryCode, documentType]
  );

  // Recreate schema when documentType changes to update validation
  const documentSchema = React.useMemo(
    () => createDocumentSchema(countryCode, documentType),
    [countryCode, documentType]
  );

  // Recreate resolver when schema changes
  const resolver = React.useMemo(
    () => yupResolver(documentSchema) as any,
    [documentSchema]
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver,
    defaultValues: {
      document: formData.document || '',
      documentType: formData.documentType as DocumentType | undefined,
    },
    mode: 'onChange',
  });

  const watchedDocument = watch('document');
  const watchedDocumentType = watch('documentType');

  // Initialize and sync documentType - combined effect for better performance
  useEffect(() => {
    // Initialize with default if not set
    if (!documentType && !watchedDocumentType) {
      const defaultType =
        documentTypes.length === 1
          ? documentTypes[0].value
          : getDefaultDocumentTypeForCountry(countryCode);
      setDocumentType(defaultType);
      setValue('documentType', defaultType, { shouldValidate: false });
      return;
    }

    // Sync form value with state when documentType changes
    if (documentType && documentType !== watchedDocumentType) {
      setValue('documentType', documentType, { shouldValidate: false });
    }

    // Sync state with form value when form value changes
    if (watchedDocumentType && watchedDocumentType !== documentType) {
      setDocumentType(watchedDocumentType);
    }
  }, [documentType, watchedDocumentType, countryCode, documentTypes, setValue]);

  // Revalidate document field when type changes
  useEffect(() => {
    if (watchedDocument && documentType) {
      const timer = setTimeout(() => trigger('document'), 50);
      return () => clearTimeout(timer);
    }
  }, [documentType, watchedDocument, trigger]);

  // Format document value based on selected type
  // Also detect document type automatically when possible
  const handleDocumentFormat = useCallback(
    (value: string) => {
      // Auto-detect document type if not set and we have enough characters
      if (!documentType && value) {
        const normalized = value.replace(/\D/g, '');
        const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

        // Only detect when we have enough characters (at least 8 for most document types)
        if (normalized.length >= 8 || cleaned.length >= 8) {
          const detectedType = detectDocumentType(value, countryCode);
          if (detectedType && documentTypes.some(dt => dt.value === detectedType)) {
            setDocumentType(detectedType);
            setValue('documentType', detectedType, { shouldValidate: false });
          }
        }
      }

      // Format using current type or detected type
      const typeToUse = documentType || (value ? detectDocumentType(value, countryCode) : null);
      return formatDocumentValue(value, countryCode, typeToUse || undefined);
    },
    [documentType, countryCode, documentTypes, setValue]
  );

  const handleDocumentTypeChange = useCallback(
    (type: DocumentType) => {
      // Update documentType in form and state
      setValue('documentType', type, { shouldValidate: false });
      setDocumentType(type);

      // Reformat document value when type changes
      if (watchedDocument) {
        const normalized = normalizeDocument(watchedDocument, countryCode, documentType || undefined);
        const formatted = formatDocumentValue(normalized, countryCode, type);
        setValue('document', formatted, { shouldValidate: false });
      }

      // Force revalidation after form value is updated
      setTimeout(() => {
        if (watchedDocument) {
          trigger('document');
        }
      }, 100);
    },
    [watchedDocument, countryCode, documentType, setValue, trigger]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const onSubmit = useCallback(
    async (data: DocumentFormData) => {
      setIsSubmitting(true);
      try {
        await updateFormData(
          {
            document: data.document || undefined,
            documentType: data.documentType || undefined,
          },
          'document'
        );
        router.push('/onboarding/name');
      } catch (error: any) {
        console.error('Failed to save document step:', error);
        showError(
          t('common.error') || 'Error',
          error?.response?.data?.message ||
          error?.message ||
          t('onboarding.saveError') ||
          'Failed to save. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateFormData, showError, t]
  );

  // Memoize document type options (only recalculates when translations change)
  const documentTypeOptions: AutocompleteOption<DocumentType>[] = useMemo(
    () =>
      documentTypes.map((dt) => ({
        value: dt.value,
        label: t(`onboarding.${dt.labelKey}`) || dt.label,
      })),
    [documentTypes, t]
  );

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
            keyboardShouldPersistTaps='handled'
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

              <Typography variant='h4'>{t('onboarding.document')}</Typography>

              <Typography variant='body1'>
                {t('onboarding.documentDescriptionOptional') || t('onboarding.documentDescription')}
              </Typography>

              <View style={styles.documentContainer}>
                {/* Document Type Selector - Always show since we have multiple options */}
                <View style={styles.typeSelector}>
                  <Autocomplete<DocumentType>
                    options={documentTypeOptions}
                    value={documentType || null}
                    onValueChange={handleDocumentTypeChange}
                    placeholder={t('onboarding.documentType') || 'Tipo de documento'}
                    searchable={true}
                    label={t('onboarding.documentType')}
                  />
                </View>

                {/* Input Field */}
                <Input
                  name='document'
                  control={control}
                  error={errors.document?.message}
                  onFormat={handleDocumentFormat}
                  className='border-0 rounded-none px-0 py-4 font-medium'
                  style={[
                    {
                      fontSize: 22,
                      borderBottomColor: errors.document ? '#ef4444' : colors.icon,
                    },
                  ]}
                  placeholder={formatConfig.placeholder}
                  placeholderTextColor={colors.icon}
                  keyboardType={documentType === 'ni' || documentType === 'crn' ? 'default' : 'numeric'}
                  autoCapitalize={documentType === 'ni' || documentType === 'crn' ? 'characters' : 'none'}
                  maxLength={formatConfig.maxLength}
                  autoFocus={false}
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
              onPress={handleSubmit(onSubmit)}
              disabled={false} // Document is optional, so always enabled
              loading={isSubmitting}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DocumentScreen;

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
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  typeSelector: {
    marginTop: 8,
    gap: 12,
  },
  typeSelectorLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  buttonContainer: {
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  documentContainer: {
    flex: 1,
    gap: 30,
  },
});
