import React, {
 useCallback, useEffect, useMemo, useState 
} from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import {
  Autocomplete,
  type AutocompleteOption,
} from '@/components/ui/Autocomplete';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
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
import { useEditClientStore } from '@/lib/stores/editClientStore';
import { detectCountryFromLocale } from '@/lib/utils/geolocation';
import { createDocumentSchema } from '@/lib/validations/onboarding';

import { useNewClientForm } from './_context';

interface DocumentFormData {
  document: string;
  documentType?: DocumentType;
}

export default function DocumentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{
    clientId?: string;
    edit?: string;
  }>();
  const isEditMode = !!searchParams.clientId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditClientStore();
  const {
 formData, updateFormData, setCurrentStep 
} = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  // Get initial values based on mode
  const initialDocument = isEditMode ? draft.document : formData.document;
  const initialDocumentType = isEditMode
    ? draft.documentType
    : formData.documentType;
  const initialCountryCode = isEditMode
    ? draft.address?.countryCode
    : formData.address?.countryCode;

  // Memoize country detection (only runs once)
  const detectedCountry = useMemo(() => detectCountryFromLocale(), []);
  const countryCode: CountryCode = useMemo(
    () => (initialCountryCode as CountryCode) || detectedCountry,
    [initialCountryCode, detectedCountry]
  );

  const [documentType, setDocumentType] = useState<DocumentType | undefined>(
    (initialDocumentType as DocumentType) || undefined
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
    () =>
      createDocumentSchema(countryCode, documentType, {documentRequired: true,}),
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
      document: initialDocument || '',
      documentType: initialDocumentType as DocumentType | undefined,
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
          if (
            detectedType &&
            documentTypes.some((dt) => dt.value === detectedType)
          ) {
            setDocumentType(detectedType);
            setValue('documentType', detectedType, { shouldValidate: false });
          }
        }
      }

      // Format using current type or detected type
      const typeToUse =
        documentType || (value ? detectDocumentType(value, countryCode) : null);
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
        const normalized = normalizeDocument(
          watchedDocument,
          countryCode,
          documentType || undefined
        );
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

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        updateDraft({
          document: data.document || undefined,
          documentType: data.documentType || undefined,
        });
        router.back();
        return;
      }
      updateFormData({
        document: data.document || undefined,
        documentType: data.documentType || undefined,
      });
      setCurrentStep(5);
      router.push('/clients/new/documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoize document type options (only recalculates when translations change)
  const documentTypeOptions: AutocompleteOption<DocumentType>[] = useMemo(
    () =>
      documentTypes.map((dt) => ({
        value: dt.value,
        label: t(`onboarding.${dt.labelKey}`) || dt.label,
      })),
    [documentTypes, t]
  );

  const clientName =
    (isEditMode ? draft.name : formData.name) || t('clients.yourClient');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            {/* Title */}
            <Typography
              variant="h3"
              color="text"
            >
              {t('clients.document')}
            </Typography>

            {/* Question */}
            <Typography
              variant="body1"
              style={[styles.question, { color: colors.text }]}
            >
              {t('clients.documentQuestion', { name: clientName })}
            </Typography>

            <View style={styles.documentContainer}>
              {/* Document Type Selector */}
              <View style={styles.typeSelector}>
                <Autocomplete<DocumentType>
                  options={documentTypeOptions}
                  value={documentType || null}
                  onValueChange={handleDocumentTypeChange}
                  placeholder={
                    t('onboarding.documentType') || 'Tipo de documento'
                  }
                  searchable={true}
                  label={t('onboarding.documentType')}
                />
              </View>

              {/* Input Field */}
              <Input
                name="document"
                control={control}
                error={errors.document?.message}
                onFormat={handleDocumentFormat}
                className="border-0 rounded-none px-0 py-4 font-medium"
                style={[
                  {
                    fontSize: 22,
                    borderBottomColor: errors.document
                      ? '#ef4444'
                      : colors.icon,
                  },
                ]}
                placeholder={formatConfig.placeholder}
                placeholderTextColor={colors.icon}
                keyboardType={
                  documentType === 'ni' || documentType === 'crn'
                    ? 'default'
                    : 'numeric'
                }
                autoCapitalize={
                  documentType === 'ni' || documentType === 'crn'
                    ? 'characters'
                    : 'none'
                }
                maxLength={formatConfig.maxLength}
                autoFocus={false}
              />
            </View>
          </ThemedView>
        </ScrollView>

        {/* Continue Button */}
        <View
          style={[
            styles.buttonContainer,
            keyboardHeight > 0 && { marginBottom: keyboardHeight },
          ]}
        >
          <IconButton
            variant="primary"
            size="md"
            icon="arrow-forward"
            iconSize={32}
            iconColor={colors.primaryForeground}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,},
  scrollView: {flex: 1,},
  scrollContent: {flexGrow: 1,},
  content: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    marginBottom: 24,
    opacity: 0.8,
  },
  typeSelector: {
    marginTop: 8,
    gap: 12,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
  documentContainer: {
    flex: 1,
    gap: 30,
  },
});
