import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { createClient } from '@/lib/services/clientService';
import { getAllDocumentTypes } from '@/lib/services/documentService';
import { useQueryClient } from '@tanstack/react-query';

import { useNewClientForm } from './_context';
import SummaryItem from './components/SummaryItem';

export default function SummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formData, resetFormData } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Prepare client data for API
      const clientData = {
        name: formData.name!,
        avatar: formData.avatar, // Include avatar
        phone: formData.whatsapp?.formattedPhoneNumber || formData.whatsapp?.phoneNumber,
        email: formData.email,
        document: formData.document,
        documentType: formData.documentType,
        documentImages: formData.documentImages, // Include document images
        address: formData.address
          ? {
            postalCode: formData.address.postalCode,
            street: formData.address.street,
            neighborhood: formData.address.neighborhood,
            city: formData.address.city,
            state: formData.address.state,
            country: formData.address.country,
            number: formData.address.number,
            complement: formData.address.complement,
          }
          : undefined,
        // Additional fields
        observation: formData.observation,
        guarantorId: formData.guarantor?.id,
        reliability: formData.reliability,
      };

      await createClient(clientData);

      // Invalidate and refetch clients list
      await queryClient.invalidateQueries({ queryKey: ['clients'] });

      showSuccess(t('clients.successTitle'), t('clients.successMessage'));
      resetFormData();
      router.replace('/(tabs)/clients');
    } catch (error: any) {
      console.error('Error creating client:', error);
      showError(t('clients.errorTitle'), t('clients.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = () => {
    if (!formData.address) return t('clients.summaryNotInformed');
    const addr = formData.address;
    const parts = [
      addr.street + ', ' + t('clients.addressNumber', { number: addr.number }),
      addr.neighborhood,
      addr.city + ', ' + addr.state,
      addr.complement && t('clients.addressComplement', { complement: addr.complement }),
      addr.postalCode && t('clients.addressPostalCode', { code: addr.postalCode }),
    ].filter(Boolean);

    return (
      <View style={styles.addressContainer}>
        {parts.map((part, index) => (
          <Typography
            key={index}
            variant="body1"
            color="primaryForeground"
            style={styles.addressLine}
          >
            {part}
          </Typography>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.content}>
            {/* Title */}
            <Typography variant="h3" style={[styles.title, { color: colors.text }]}>
              {t('clients.summary')}
            </Typography>

            {/* Summary Card */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.summaryCard, { backgroundColor: colors.muted }]}>
                {/* Avatar */}
                {formData.avatar && (
                  <View style={styles.avatarSection}>
                    <Avatar image={formData.avatar} size={80} />
                  </View>
                )}

                {/* Name */}
                <SummaryItem icon='user-circle' label={t('clients.summaryName')} value={formData.name || t('clients.summaryNotInformed')} />

                {/* WhatsApp */}
                <SummaryItem icon='whatsapp' label={t('clients.summaryWhatsapp')} value={formData.whatsapp?.formattedPhoneNumber || formData.whatsapp?.phoneNumber || t('clients.summaryNotInformed')} />

                {/* Email */}
                {formData.email && (
                  <SummaryItem icon='mail' label={t('clients.summaryEmail')} value={formData.email} />
                )}

                {/* Document */}
                {formData.document && (() => {
                  const documentTypeLabel = formData.documentType
                    ? getAllDocumentTypes().find(dt => dt.value === formData.documentType)?.labelKey
                    : null;
                  const displayValue = documentTypeLabel
                    ? `${t(`onboarding.${documentTypeLabel}`)}: ${formData.document}`
                    : formData.document;
                  return (
                    <SummaryItem
                      icon='id-card'
                      label={t('clients.summaryDocument')}
                      value={displayValue}
                    />
                  );
                })()}

                {/* Address */}
                <SummaryItem icon='map-pin' label={t('clients.summaryAddress')} value={formatAddress()} />

                {/* Observation */}
                {formData.observation && (
                  <SummaryItem icon='note' label={t('clients.summaryObservation')} value={formData.observation} />
                )}

                {/* Guarantor */}
                {formData.guarantor && (
                  <SummaryItem icon='user-share' label={t('clients.summaryGuarantor')} value={<View style={styles.guarantorRow}>
                    <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                      {formData.guarantor.name}
                    </Typography>
                    {formData.guarantor.rating && (
                      <View style={styles.ratingRow}>
                        <Icon name="star" size={16} color="#fbbf24" />
                        <Typography variant="caption" style={{ color: colors.text }}>
                          {formData.guarantor.rating}
                        </Typography>
                      </View>
                    )}
                  </View>} />
                )}

                {/* Reliability */}
                {formData.reliability && (
                  <SummaryItem icon='star' label={t('clients.summaryReliability')} value={<View style={styles.reliabilityRow}>
                    <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                      {t('clients.reliabilityLevel', { level: formData.reliability })}
                    </Typography>
                  </View>} />
                )}
              </View>
            </ScrollView>
          </ThemedView>

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size='full'
              onPress={handleConfirm}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {t('clients.summaryConfirm')}
            </Button>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    gap: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryRow: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  guarantorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reliabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '23%',
  },
  addressContainer: {
    gap: 4,
  },
  addressLine: {
    fontSize: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
