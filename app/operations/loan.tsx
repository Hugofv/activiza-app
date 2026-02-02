import { useEffect, useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Autocomplete } from '@/components/ui/Autocomplete';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { createOfflineQueryOptions } from '@/lib/hooks/useQuery';
import { useToast } from '@/lib/hooks/useToast';
import { type Client, getClients } from '@/lib/services/clientService';

interface LoanFormData {
  amount: string;
  interest: string;
  dueDate?: string;
  observation?: string;
}

export default function LoanScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { showSuccess } = useToast();
  const keyboardHeight = useKeyboardHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const { data: clientsData } = useQuery(
    createOfflineQueryOptions({
      queryKey: ['clients', 'loan-search', debouncedSearch],
      queryFn: () =>
        debouncedSearch ? getClients({ search: debouncedSearch }) : getClients({}),
      staleTime: 1000 * 60,
    })
  );

  const clients: Client[] = clientsData?.results ?? [];
  const clientOptions = clients.slice(0, 10).map((client) => ({
    value: String(client.id),
    label: client.name ?? client.meta?.name ?? '',
  }));

  const loanSchema = yup.object().shape({
    amount: yup
      .string()
      .required(t('operations.amount') + ' ' + t('common.validation.required'))
      .test('positive', t('operations.invalidValue'), (v) => {
        const n = parseFloat((v ?? '').replace(/\D/g, '').replace(',', '.'));
        return !isNaN(n) && n > 0;
      }),
    interest: yup
      .string()
      .required(t('operations.interest') + ' ' + t('common.validation.required'))
      .test('valid-percent', t('operations.invalidValue'), (v) => {
        const n = parseFloat((v ?? '').replace(',', '.'));
        return !isNaN(n) && n >= 0 && n <= 100;
      }),
    dueDate: yup.string().optional(),
    observation: yup.string().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoanFormData>({
    resolver: yupResolver(loanSchema) as any,
    defaultValues: {
      amount: '',
      interest: '',
      dueDate: '',
      observation: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (_data: LoanFormData) => {
    if (!selectedClientId) {
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: call loan API when endpoint exists
      showSuccess(t('operations.createLoan'), t('operations.lendLoanDescription'));
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <Typography
            variant="h4"
            style={[styles.headerTitle, { color: colors.text }]}
          >
            {t('operations.lendLoan')}
          </Typography>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardHeight + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Typography
            variant="body1"
            style={[styles.description, { color: colors.placeholder }]}
          >
            {t('operations.lendLoanDescription')}
          </Typography>

          <Typography
            variant="body2Medium"
            style={[styles.fieldLabel, { color: colors.text }]}
          >
            {t('operations.selectClient')}
          </Typography>
          <Autocomplete
            options={clientOptions}
            value={selectedClientId}
            onValueChange={setSelectedClientId}
            placeholder={t('operations.selectClient')}
            onSearchChange={setSearchQuery}
            label={t('operations.selectClient')}
          />

          <Input
            control={control}
            name="amount"
            label={t('operations.amount')}
            placeholder="0,00"
            keyboardType="decimal-pad"
            error={errors.amount?.message}
          />

          <Input
            control={control}
            name="interest"
            label={t('operations.interest')}
            placeholder="0"
            keyboardType="decimal-pad"
            error={errors.interest?.message}
          />

          <Input
            control={control}
            name="dueDate"
            label={t('operations.dueDate')}
            placeholder="DD/MM/AAAA"
            error={errors.dueDate?.message}
          />

          <Input
            control={control}
            name="observation"
            label={t('operations.observation')}
            placeholder={t('operations.observation')}
            multiline
            numberOfLines={3}
            error={errors.observation?.message}
          />

          <Button
            variant="primary"
            size="full"
            onPress={handleSubmit(onSubmit)}
            disabled={!selectedClientId || !isValid || isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? '...' : t('operations.createLoan')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 16,
  },
  headerLeft: { width: 80 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: { width: 80 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  description: { marginBottom: 24 },
  fieldLabel: { marginBottom: 8 },
  submitButton: { marginTop: 32 },
});
