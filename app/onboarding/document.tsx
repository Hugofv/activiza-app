import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Autocomplete, type AutocompleteOption } from '@/components/ui/autocomplete';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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

import { Typography } from '@/components/ui/typography';
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

  // Detect country from geolocation or use address country code, fallback to detected locale
  const detectedCountry = detectCountryFromLocale();
  const countryCode: CountryCode = (formData.address?.countryCode as CountryCode) || detectedCountry;

  const [documentType, setDocumentType] = useState<DocumentType | undefined>(
    (formData.documentType as DocumentType) || undefined
  );

  // Get all available document types (not limited by country)
  const documentTypes = getAllDocumentTypes();

  // Get document format config based on country and type
  const formatConfig = getDocumentFormat(countryCode, documentType);

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

  // Sync state with form value
  useEffect(() => {
    if (watchedDocumentType !== documentType) {
      setDocumentType(watchedDocumentType as DocumentType | undefined);
    }
  }, [watchedDocumentType, documentType]);

  // Revalidate when documentType changes - ensure form value is synced
  useEffect(() => {
    // Sync form value with state
    if (documentType) {
      setValue('documentType', documentType, { shouldValidate: false });
    }

    // Revalidate document field when type changes
    if (watchedDocument && documentType) {
      // Small delay to ensure form value is updated
      const timer = setTimeout(() => {
        trigger('document');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [documentType, trigger, watchedDocument, setValue, watchedDocumentType]);

  // Initialize documentType with default for country if not set
  useEffect(() => {
    if (!documentType) {
      if (documentTypes.length === 1) {
        // Only one option, use it
        setDocumentType(documentTypes[0].value);
      } else if (documentTypes.length > 1) {
        // Multiple options, use default for country
        const defaultType = getDefaultDocumentTypeForCountry(countryCode);
        setDocumentType(defaultType);
        setValue('documentType', defaultType);
      }
    }
  }, [countryCode, documentType, documentTypes, setValue]);

  // Format document value based on selected type
  // Also detect document type automatically when possible
  const handleDocumentFormat = (value: string) => {
    // Detect document type automatically if not set and value is being entered
    // Try to detect based on value length and format
    if (!documentType && value) {
      const normalized = value.replace(/\D/g, '');
      const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();

      // Only detect when we have enough characters (at least 8 for most document types)
      if (normalized.length >= 8 || cleaned.length >= 8) {
        // Try to detect from country first, then try all types
        let detectedType = detectDocumentType(value, countryCode);

        // If not detected from country, try common patterns
        if (!detectedType) {
          // CPF: 11 digits
          if (normalized.length === 11) {
            detectedType = 'cpf';
          }
          // CNPJ: 14 digits
          else if (normalized.length === 14) {
            detectedType = 'cnpj';
          }
          // SSN/EIN: 9 digits
          else if (normalized.length === 9) {
            detectedType = 'ssn'; // Default to SSN
          }
          // UK NI: 9 alphanumeric (2 letters + 6 numbers + 1 letter)
          else if (/^[A-Z]{2}\d{6}[A-Z]$/.test(cleaned)) {
            detectedType = 'ni';
          }
          // UK CRN: 8 digits
          else if (normalized.length === 8) {
            detectedType = 'crn';
          }
        }

        if (detectedType && documentTypes.some(dt => dt.value === detectedType)) {
          setDocumentType(detectedType);
          setValue('documentType', detectedType);
        }
      }
    }

    // Use current documentType for formatting
    // If type is set, use it; otherwise try to detect
    if (documentType) {
      return formatDocumentValue(value, countryCode, documentType);
    }

    // Try to detect type for formatting
    const detectedType = value ? detectDocumentType(value, countryCode) : null;
    return formatDocumentValue(value, countryCode, detectedType || undefined);
  };

  const handleDocumentTypeChange = async (type: DocumentType) => {
    // CRITICAL: Update documentType in form FIRST - this is the source of truth for validation
    setValue('documentType', type, { shouldValidate: false });

    // Then update state
    setDocumentType(type);

    // Reformat document value when type changes
    if (watchedDocument) {
      const normalized = normalizeDocument(watchedDocument, countryCode, documentType || undefined);
      const formatted = formatDocumentValue(normalized, countryCode, type);
      setValue('document', formatted, { shouldValidate: false });
    }

    // Force revalidation after form value is updated
    // Use a small delay to ensure form value is committed
    setTimeout(() => {
      if (watchedDocument) {
        trigger('document');
      }
    }, 100);
  };

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: DocumentFormData) => {
    // Update form data and save to API with step tracking (unified)
    setIsSubmitting(true);
    try {
      await updateFormData({
        document: data.document || undefined,
        documentType: data.documentType || undefined,
      }, 'document');
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
  };

  // Build document type options for Autocomplete
  const documentTypeOptions: AutocompleteOption<DocumentType>[] = documentTypes.map((dt: { value: DocumentType; label: string; labelKey: string }) => ({
    value: dt.value,
    label: t(`onboarding.${dt.labelKey}`) || dt.label,
  }));

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
                    fontSize: 28,
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
});
