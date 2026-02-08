import { useEffect, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Autocomplete } from '@/components/ui/Autocomplete';
import { IconButton } from '@/components/ui/IconButton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { createOfflineQueryOptions, useQuery } from '@/lib/hooks/useQuery';
import { Client, getClients } from '@/lib/services/clientService';
import { useEditClientStore } from '@/lib/stores/editClientStore';

import { useNewClientForm } from './_context';

export default function GuarantorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams<{
    clientId?: string;
    edit?: string;
  }>();
  const isEditMode = !!searchParams.clientId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditClientStore();
  const { formData, updateFormData, setCurrentStep } = useNewClientForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const initialGuarantorId = isEditMode
    ? (draft.guarantorId ?? null)
    : formData.guarantor?.id || null;
  const [selectedGuarantorId, setSelectedGuarantorId] = useState<string | null>(
    initialGuarantorId
  );
  const keyboardHeight = useKeyboardHeight();

  // Debounce the search query to avoid spamming the API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const { data: clientsData } = useQuery(
    createOfflineQueryOptions({
      queryKey: ['clients', 'guarantor-search', debouncedSearch],
      // If search is empty, we can either avoid hitting the API or return first page.
      // Here we just don't search when empty and reuse last data.
      queryFn: () =>
        debouncedSearch
          ? getClients({ search: debouncedSearch })
          : getClients({}),
      staleTime: 1000 * 60, // 1 minute
    })
  );

  const clients: Client[] = clientsData?.results ?? [];
  const options = clients.slice(0, 10).map((client) => ({
    value: String(client.id),
    label: client.name ?? client.meta?.name ?? '',
  }));

  const handleGuarantorChange = (value: string) => {
    setSelectedGuarantorId(value);
    const client = clients.find((c) => String(c.id) === value);
    if (isEditMode) {
      updateDraft({
        guarantorId: value || undefined,
        _guarantor: client || undefined,
      });
      return;
    }
    if (client) {
      updateFormData({
        guarantor: {
          id: value,
          name: client.name ?? client.meta?.name ?? '',
          reliability:
            client.meta?.reliability != null
              ? Number(client.meta?.reliability)
              : undefined,
        },
      });
    }
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Already updated in handleGuarantorChange
        router.back();
        return;
      }
      setCurrentStep(9);
      router.push('/clients/new/reliability');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Typography
              variant="h3"
              color="text"
            >
              {t('clients.reference')}
            </Typography>

            <Typography
              variant="body2"
              color="placeholder"
            >
              {t('clients.optional')}
            </Typography>
          </View>

          {/* Guarantor Autocomplete */}
          <Autocomplete
            options={options}
            value={selectedGuarantorId}
            onValueChange={handleGuarantorChange}
            placeholder={t('clients.guarantorSelect')}
            label={t('clients.guarantor')}
            onSearchChange={setSearchQuery}
          />
        </ThemedView>

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
            onPress={handleNext}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
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
  question: {
    fontSize: 18,
    marginBottom: 24,
    opacity: 0.8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
});
