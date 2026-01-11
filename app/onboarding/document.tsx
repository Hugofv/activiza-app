import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { ListCheck, type ListCheckOption } from '@/components/ui/list-check';
import { Progress } from '@/components/ui/progress';
import { Colors } from '@/constants/theme';
import { useOnboardingForm } from '@/contexts/onboardingFormContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type DocumentType,
  detectDocumentType,
  formatDocument as formatDocumentValue,
  getDocumentFormat,
  getDocumentTypesForCountry,
  normalizeDocument,
} from '@/lib/services/documentService';
import type { CountryCode } from '@/lib/services/postalCodeService';
import { createDocumentSchema } from '@/lib/validations/onboarding';

import { Typography } from '@/components/ui/typography';
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
  const { formData, updateFormData, saveFormData } = useOnboardingForm();

  // Get country code from address or default to BR
  const countryCode: CountryCode = (formData.address?.countryCode as CountryCode) || 'BR';
  const [documentType, setDocumentType] = useState<DocumentType | undefined>(
    (formData.documentType as DocumentType) || undefined
  );

  // Get available document types for the selected country
  const documentTypes = getDocumentTypesForCountry(countryCode);
  const showDocumentTypeSelector = documentTypes.length > 1;

  // Initialize documentType if not set and there's only one option
  useEffect(() => {
    if (!documentType && documentTypes.length === 1) {
      setDocumentType(documentTypes[0].value);
    }
  }, [countryCode, documentType, documentTypes]);

  // Get document format config based on country and type
  const formatConfig = getDocumentFormat(countryCode, documentType);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: yupResolver(createDocumentSchema(countryCode, documentType)) as any,
    defaultValues: {
      document: formData.document || '',
      documentType: formData.documentType as DocumentType | undefined,
    },
    mode: 'onChange',
  });

  const watchedDocument = watch('document');

  // Format document value based on country and type
  // Also detect document type automatically when possible
  const handleDocumentFormat = (value: string) => {
    // Detect document type automatically if not set and value is being entered
    // Only detect when we have enough characters to determine the type
    if (!documentType && value && !showDocumentTypeSelector) {
      // For countries with multiple types, try to detect when value is long enough
      const normalized = value.replace(/\D/g, '');
      const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      
      // Only detect when we have enough characters (at least 8 for most document types)
      if (normalized.length >= 8 || cleaned.length >= 8) {
        const detectedType = detectDocumentType(value, countryCode);
        if (detectedType !== null && documentTypes.some(dt => dt.value === detectedType)) {
          setDocumentType(detectedType);
          setValue('documentType', detectedType);
        }
      }
    }
    
    // Use detected type or current documentType for formatting
    const detectedType = value ? detectDocumentType(value, countryCode) : null;
    const typeForFormatting = documentType || detectedType || undefined;
    return formatDocumentValue(value, countryCode, typeForFormatting);
  };

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    setValue('documentType', type);
    // Reformat document value when type changes
    if (watchedDocument) {
      const normalized = normalizeDocument(watchedDocument, countryCode, documentType || undefined);
      const formatted = formatDocumentValue(normalized, countryCode, type);
      setValue('document', formatted);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: DocumentFormData) => {
    updateFormData({
      document: data.document || undefined,
      documentType: data.documentType || undefined,
    });
    
    // Save document step to API
    try {
      await saveFormData();
    } catch (error) {
      // Don't block navigation if save fails (offline mode will queue it)
      console.warn('Failed to save document step, will retry:', error);
    }
    
    router.push('/onboarding/name');
  };

  // Build document type options for ListCheck
  const documentTypeOptions: ListCheckOption<DocumentType>[] = documentTypes.map((dt: { value: DocumentType; label: string; labelKey: string }) => ({
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

              {/* Document Type Selector (only if multiple options) */}
              {showDocumentTypeSelector && (
                <View style={styles.typeSelector}>
                  <Typography variant='body2' style={styles.typeSelectorLabel}>
                    {t('onboarding.documentType')}
                  </Typography>
                  <ListCheck
                    options={documentTypeOptions}
                    selectedValue={documentType || null}
                    onValueChange={(value: DocumentType | DocumentType[]) => handleDocumentTypeChange(value as DocumentType)}
                  />
                </View>
              )}

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
                keyboardType={countryCode === 'UK' && (documentType === 'ni' || !documentType) ? 'default' : 'numeric'}
                autoCapitalize={countryCode === 'UK' ? 'characters' : 'none'}
                maxLength={formatConfig.maxLength}
                autoFocus={!showDocumentTypeSelector}
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
