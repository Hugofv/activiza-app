import { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { router } from 'expo-router';

import { useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useToast } from '@/lib/hooks/useToast';
import { createClient } from '@/lib/services/clientService';
import { getAllDocumentTypes } from '@/lib/services/documentService';

import { useNewClientForm } from './_context';
import SummaryItem from './components/SummaryItem';

export default function SummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { formData, resetFormData } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keyboardHeight = useKeyboardHeight();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Prepare client data for API
      const clientData = {
        name: formData.name!,
        avatar: formData.avatar, // Include avatar
        phone:
          formData.whatsapp?.formattedPhoneNumber ||
          formData.whatsapp?.phoneNumber,
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
      `${addr.street}, ${t('clients.addressNumber', { number: addr.number })}`,
      addr.neighborhood,
      `${addr.city}, ${addr.state}`,
      addr.complement &&
        t('clients.addressComplement', { complement: addr.complement }),
      addr.postalCode &&
        t('clients.addressPostalCode', { code: addr.postalCode }),
    ].filter(Boolean);

    return (
      <View style={styles.addressContainer}>
        {parts.map((part, index) => (
          <Typography
            key={index}
            variant="body1"
            color="text"
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
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Title */}
          <Typography
            variant="h3"
            style={[styles.title, { color: colors.text }]}
          >
            {t('clients.summary')}
          </Typography>

          {/* Summary Card - internal scroll only */}
          <View style={styles.scrollView}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.background },
              ]}
            >
              <ScrollView
                style={{ maxHeight: height * 0.55 }}
                contentContainerStyle={styles.summaryCardContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Avatar */}
                {formData.avatar && (
                  <View style={styles.avatarSection}>
                    <Avatar
                      image={formData.avatar}
                      size={80}
                    />
                  </View>
                )}

                {/* Name */}
                <SummaryItem
                  icon="user-circle"
                  label={t('clients.summaryName')}
                  value={formData.name || t('clients.summaryNotInformed')}
                />

                {/* WhatsApp */}
                <SummaryItem
                  icon="whatsapp"
                  label={t('clients.summaryWhatsapp')}
                  value={
                    formData.whatsapp?.formattedPhoneNumber ||
                    formData.whatsapp?.phoneNumber ||
                    t('clients.summaryNotInformed')
                  }
                />

                {/* Email */}
                {formData.email && (
                  <SummaryItem
                    icon="mail"
                    label={t('clients.summaryEmail')}
                    value={formData.email}
                  />
                )}

                {/* Document */}
                {formData.document &&
                  (() => {
                    const documentTypeLabel = formData.documentType
                      ? getAllDocumentTypes().find(
                          (dt) => dt.value === formData.documentType
                        )?.labelKey
                      : null;
                    const displayValue = documentTypeLabel
                      ? `${t(`onboarding.${documentTypeLabel}`)}: ${formData.document}`
                      : formData.document;
                    return (
                      <SummaryItem
                        icon="id"
                        label={t('clients.summaryDocument')}
                        value={displayValue}
                      />
                    );
                  })()}

                {/* Address */}
                <SummaryItem
                  icon="map-pin"
                  label={t('clients.summaryAddress')}
                  value={formatAddress()}
                />

                {/* Observation */}
                {formData.observation && (
                  <SummaryItem
                    icon="note"
                    label={t('clients.summaryObservation')}
                    value={formData.observation}
                  />
                )}

                {/* Guarantor */}
                {formData.guarantor && (
                  <SummaryItem
                    icon="user-share"
                    label={t('clients.summaryGuarantor')}
                    value={
                      <View style={styles.guarantorRow}>
                        <Badge
                          icon="user-circle"
                          value={
                            <View style={styles.guarantorNameRow}>
                              <Typography
                                variant="body2SemiBold"
                                style={{ fontSize: 13 }}
                              >
                                {formData.guarantor.name}
                              </Typography>
                              <Icon
                                name="star-filled"
                                color="primaryForeground"
                                size={16}
                                style={{
                                  paddingLeft: 4,
                                  borderLeftWidth: 2,
                                  borderLeftColor: colors.border,
                                }}
                              />
                              <Typography
                                variant="body2Medium"
                                style={{ fontSize: 13 }}
                                color="text"
                              >
                                {formData.guarantor.reliability || 0}
                              </Typography>
                            </View>
                          }
                          backgroundColor="muted"
                          foregroundColor="primaryForeground"
                          size="sm"
                        />
                      </View>
                    }
                  />
                )}

                {/* Reliability */}
                {formData.reliability && (
                  <SummaryItem
                    icon="star"
                    label={t('clients.summaryReliability')}
                    value={
                      <View style={styles.reliabilityRow}>
                        <Typography
                          variant="body1"
                          style={[styles.value, { color: colors.text }]}
                        >
                          {t('clients.reliabilityLevel', {
                            level: formData.reliability,
                          })}
                        </Typography>
                      </View>
                    }
                  />
                )}

                {/* Document Images */}
                {formData.documentImages && (
                  <SummaryItem
                    icon="photo"
                    label={t('clients.documents')}
                    value={
                      <View style={styles.documentImagesRow}>
                        {formData.documentImages.map((image) => (
                          <ImageCardView
                            key={image}
                            uri={image}
                          />
                        ))}
                      </View>
                    }
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </ThemedView>

        {/* Confirm Button */}
        <View
          style={[
            styles.buttonContainer,
            keyboardHeight > 0 && { marginBottom: keyboardHeight },
          ]}
        >
          <Button
            variant="primary"
            size="full"
            onPress={handleConfirm}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {t('clients.summaryConfirm')}
          </Button>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scrollView: { flex: 1 },
  summaryCard: {
    borderRadius: 12,
    borderColor: Colors.light.border,
    borderWidth: 1,
    padding: 20,
  },
  summaryCardContent: { gap: 20 },
  avatarSection: { marginBottom: 8 },
  summaryRow: { gap: 8 },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: { fontSize: 16 },
  guarantorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guarantorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  addressContainer: { gap: 4 },
  addressLine: { fontSize: 16 },
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
  documentImagesRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
