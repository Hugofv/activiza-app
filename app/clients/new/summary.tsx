import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { createClient } from '@/lib/services/clientService';
import { getAllDocumentTypes } from '@/lib/services/documentService';
import { useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { useNewClientForm } from './_context';
import SummaryItem from './components/SummaryItem';

export default function SummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { _formData, resetFormData } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const formData = { "address": { "city": "Nerópolis", "complement": "", "country": "Brasil", "countryCode": "BR", "neighborhood": "Parque das Américas", "number": "343", "postalCode": "75460-110", "state": "GO", "street": "Rua 17" }, "avatar": "file:///Users/hugofv/Library/Developer/CoreSimulator/Devices/2154EE22-B4CA-47FA-A7CE-3D1C4AD81692/data/Containers/Data/Application/1D7CF1AB-FE56-437A-B2CC-4563B844A3FE/Library/Caches/ExponentExperienceData/@anonymous/ativiza-f3472adc-964f-4cdd-bd37-7ef8ba11c318/ImagePicker/2BFF9359-FEF0-4EE5-A716-7A004CFABC31.jpg", "document": "927.827.382-73", "documentImages": ["file:///Users/hugofv/Library/Developer/CoreSimulator/Devices/2154EE22-B4CA-47FA-A7CE-3D1C4AD81692/data/Containers/Data/Application/1D7CF1AB-FE56-437A-B2CC-4563B844A3FE/Library/Caches/ExponentExperienceData/@anonymous/ativiza-f3472adc-964f-4cdd-bd37-7ef8ba11c318/ImagePicker/23DE0244-5204-4DB4-B2C4-69EBD21755B5.jpg", "file:///Users/hugofv/Library/Developer/CoreSimulator/Devices/2154EE22-B4CA-47FA-A7CE-3D1C4AD81692/data/Containers/Data/Application/1D7CF1AB-FE56-437A-B2CC-4563B844A3FE/Library/Caches/ExponentExperienceData/@anonymous/ativiza-f3472adc-964f-4cdd-bd37-7ef8ba11c318/ImagePicker/FD3A2150-1239-4B42-8D21-5C7F5FE26027.jpg"], "documentType": "cpf", "email": "jhbig@jbh.com", "guarantor": { "id": 5, "name": "Jhony", "reliability": undefined }, "name": "Wallysson", "observation": "Sdfsdfsd", "reliability": undefined, "whatsapp": { "countryCode": "+55", "formattedPhoneNumber": "+55 86 76867 6767", "phoneNumber": "86 76867 6767" } };

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
            color="text"
            style={styles.addressLine}
          >
            {part}
          </Typography>
        ))}
      </View>
    );
  };

  console.log('formData', formData);
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

            {/* Summary Card - internal scroll only */}
            <View style={styles.scrollView}>
              <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
                <ScrollView
                  style={{ maxHeight: height * 0.55 }}
                  contentContainerStyle={styles.summaryCardContent}
                  showsVerticalScrollIndicator={false}
                >
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
                        icon='id'
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
                    <SummaryItem icon='user-share' label={t('clients.summaryGuarantor')} value={
                      <View style={styles.guarantorRow}>
                        <Badge icon="user-circle" value={
                          <View style={styles.guarantorNameRow}>
                            <Typography variant='body2SemiBold' style={{ fontSize: 13 }}>
                              {formData.guarantor.name}
                            </Typography>
                            <Icon name="star-filled" color={colors.primaryForeground} size={16} style={{ paddingLeft: 4, borderLeftWidth: 2, borderLeftColor: colors.border }} />
                            <Typography variant="body2Medium" style={{ fontSize: 13 }} color="text">
                              {formData.guarantor.reliability || 0}
                            </Typography>
                          </View>
                        } backgroundColor="muted" foregroundColor="primaryForeground" size="sm" />
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

                  {/* Document Images */}
                  {formData.documentImages && (
                    <SummaryItem icon='photo' label={t('clients.documents')} value={
                      <View style={styles.documentImagesRow}>
                        {formData.documentImages.map((image) => (
                          <ExpoImage key={image} source={{ uri: image }} style={styles.documentImage} contentFit="cover" />
                        ))}
                      </View>
                    } />
                  )}
                </ScrollView>
              </View>
            </View>
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
    borderColor: Colors.light.border,
    borderWidth: 1,
    padding: 20,
  },
  summaryCardContent: {
    gap: 20,
  },
  avatarSection: {
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
