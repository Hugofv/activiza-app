import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { BackButton } from '@/components/ui/BackButton';
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

      showSuccess('Sucesso', 'Cliente criado com sucesso!');
      resetFormData();
      router.replace('/(tabs)/clients');
    } catch (error: any) {
      console.error('Error creating client:', error);
      showError('Erro', 'Não foi possível criar o cliente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = () => {
    if (!formData.address) return 'Não informado';
    const addr = formData.address;
    const parts = [
      addr.street,
      addr.number && `nº ${addr.number}`,
      addr.neighborhood,
      addr.city,
      addr.state,
      addr.complement && `Ap ${addr.complement}`,
      addr.postalCode && `CEP ${addr.postalCode}`,
    ].filter(Boolean);
    return parts.join(', ');
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
          <ThemedView style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <BackButton />
              <Typography variant="h4" style={[styles.headerTitle, { color: colors.text }]}>
                Novo cliente
              </Typography>
            </View>

            {/* Title */}
            <Typography variant="h3" style={[styles.title, { color: colors.text }]}>
              Resumo
            </Typography>

            {/* Summary Card */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.summaryCard, { backgroundColor: colors.muted }]}>
                {/* Name */}
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                    Nome
                  </Typography>
                  <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                    {formData.name || 'Não informado'}
                  </Typography>
                </View>

                {/* WhatsApp */}
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                    WhatsApp
                  </Typography>
                  <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                    {formData.whatsapp?.formattedPhoneNumber || formData.whatsapp?.phoneNumber || 'Não informado'}
                  </Typography>
                </View>

                {/* Email */}
                {formData.email && (
                  <View style={styles.summaryRow}>
                    <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                      Endereço de e-mail
                    </Typography>
                    <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                      {formData.email}
                    </Typography>
                  </View>
                )}

                {/* Address */}
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                    Endereço físico
                  </Typography>
                  <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                    {formatAddress()}
                  </Typography>
                </View>

                {/* Observation */}
                {formData.observation && (
                  <View style={styles.summaryRow}>
                    <Typography variant="body2" style={[styles.label, { color: colors.icon }]}>
                      Observação
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
                      Indicação / Avalista
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
                      Confiabilidade
                    </Typography>
                    <View style={styles.reliabilityRow}>
                      <Typography variant="body1" style={[styles.value, { color: colors.text }]}>
                        Nível {formData.reliability}
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
              Confirmar e salvar
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
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '23%',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
