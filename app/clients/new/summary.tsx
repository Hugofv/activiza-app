import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import { createClient } from '@/lib/services/clientService';
import { useQueryClient } from '@tanstack/react-query';

import { useNewClientForm } from './_context';

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
        phone: formData.whatsapp?.formattedPhoneNumber || formData.whatsapp?.phoneNumber,
        email: formData.email,
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
      addr.street,
      addr.number && t('clients.addressNumber', { number: addr.number }),
      addr.neighborhood,
      addr.city,
      addr.state,
      addr.complement && t('clients.addressComplement', { complement: addr.complement }),
      addr.postalCode && t('clients.addressPostalCode', { code: addr.postalCode }),
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
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
                {/* Name */}
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                    {t('clients.summaryName')}
                  </Typography>
                  <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                    {formData.name || t('clients.summaryNotInformed')}
                  </Typography>
                </View>

                {/* WhatsApp */}
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                    {t('clients.summaryWhatsapp')}
                  </Typography>
                  <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                    {formData.whatsapp?.formattedPhoneNumber || formData.whatsapp?.phoneNumber || t('clients.summaryNotInformed')}
                  </Typography>
                </View>

                {/* Email */}
                {formData.email && (
                  <View style={styles.summaryRow}>
                    <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                      {t('clients.summaryEmail')}
                    </Typography>
                    <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                      {formData.email}
                    </Typography>
                  </View>
                )}

                {/* Address */}
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                    {t('clients.summaryAddress')}
                  </Typography>
                  <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                    {formatAddress()}
                  </Typography>
                </View>

                {/* Observation */}
                {formData.observation && (
                  <View style={styles.summaryRow}>
                    <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                      {t('clients.summaryObservation')}
                    </Typography>
                    <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                      {formData.observation}
                    </Typography>
                  </View>
                )}

                {/* Guarantor */}
                {formData.guarantor && (
                  <View style={styles.summaryRow}>
                    <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                      {t('clients.summaryGuarantor')}
                    </Typography>
                    <View style={styles.guarantorRow}>
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
                    </View>
                  </View>
                )}

                {/* Reliability */}
                {formData.reliability && (
                  <View style={styles.summaryRow}>
                    <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                      {t('clients.summaryReliability')}
                    </Typography>
                    <View style={styles.reliabilityRow}>
                      <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                        {t('clients.reliabilityLevel', { level: formData.reliability })}
                      </Typography>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name="star"
                            size={16}
                            color={star <= formData.reliability! ? '#fbbf24' : colors.icon}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </ThemedView>

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            {isSubmitting ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <IconButton
                variant="primary"
                size="md"
                icon="check"
                iconSize={32}
                iconColor={colors.primaryForeground}
                onPress={handleConfirm}
                disabled={isSubmitting}
              />
            )}
            <Typography variant="body1" style={[styles.buttonLabel, { color: colors.text }]}>
              {t('clients.summaryConfirm')}
            </Typography>
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
