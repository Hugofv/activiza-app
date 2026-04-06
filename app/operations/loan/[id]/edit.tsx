import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import {
  amountToMoneyInputString,
  type CurrencyCode,
  MoneyInput,
} from '@/components/ui/MoneyInput';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useToast } from '@/lib/hooks/useToast';
import type { ApiError } from '@/lib/types/apiTypes';
import {
  type FrequencyType as ApiFrequencyType,
  getOperationById,
  parseAmount,
  parseInterest,
  type UpdateOperationData,
  updateOperation,
} from '@/lib/services/operationService';
import { getTranslatedError } from '@/lib/utils/errorTranslator';
import {
  dueDateFromLoanStart,
  type LoanFormFrequency,
} from '@/lib/utils/loanDueDate';

interface EditLoanFields {
  amount: string;
  interest: string;
  startDate: Date;
}

const SUPPORTED_CURRENCIES: CurrencyCode[] = ['GBP', 'USD', 'BRL', 'EUR'];

function coerceCurrency(raw: string | undefined): CurrencyCode {
  const u = (raw || 'BRL').toUpperCase();
  return SUPPORTED_CURRENCIES.includes(u as CurrencyCode)
    ? (u as CurrencyCode)
    : 'BRL';
}

function apiFrequencyToForm(api: string): LoanFormFrequency {
  switch (api?.toUpperCase()) {
    case 'DAILY':
      return 'daily';
    case 'WEEKLY':
      return 'weekly';
    case 'BIWEEKLY':
      return 'biweekly';
    case 'MONTHLY':
      return 'monthly';
    default:
      return 'weekly';
  }
}

function formFrequencyToApi(f: LoanFormFrequency): ApiFrequencyType {
  return f.toUpperCase() as ApiFrequencyType;
}

export default function LoanEditScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const keyboardHeight = useKeyboardHeight();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [frequency, setFrequency] = useState<LoanFormFrequency>('weekly');
  const lastHydratedLoanIdRef = useRef<string | null>(null);

  const currencyOptions: SelectOption[] = useMemo(
    () => [
      { value: 'GBP', label: '£ GBP' },
      { value: 'USD', label: '$ USD' },
      { value: 'BRL', label: 'R$ BRL' },
      { value: 'EUR', label: '€ EUR' },
    ],
    []
  );

  const frequencyOptions: SelectOption[] = useMemo(
    () => [
      { value: 'daily', label: t('operations.daily') },
      { value: 'weekly', label: t('operations.weekly') },
      { value: 'biweekly', label: t('operations.biweekly') },
      { value: 'monthly', label: t('operations.monthly') },
    ],
    [t]
  );

  const loanSchema = useMemo(
    () =>
      yup.object().shape({
        amount: yup
          .string()
          .required(
            `${t('operations.amount')} ${t('common.validation.required')}`
          )
          .test('positive', t('operations.invalidValue'), (v) => {
            const n = parseAmount(v ?? '');
            return !isNaN(n) && n > 0;
          }),
        interest: yup
          .string()
          .required(
            `${t('operations.interest')} ${t('common.validation.required')}`
          )
          .test('valid-percent', t('operations.invalidValue'), (v) => {
            const n = parseFloat((v ?? '').replace(',', '.'));
            return !isNaN(n) && n >= 0 && n <= 100;
          }),
        startDate: yup
          .date()
          .typeError(t('operations.invalidValue'))
          .required(
            `${t('operations.loanDate')} ${t('common.validation.required')}`
          ),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditLoanFields>({
    resolver: yupResolver(loanSchema) as any,
    defaultValues: {
      amount: '',
      interest: '',
      startDate: new Date(),
    },
    mode: 'onChange',
  });

  const {
    data: operation,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['operations', 'loan', id],
    queryFn: () => getOperationById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (!operation || !id || String(operation.id) !== String(id)) return;
    if (lastHydratedLoanIdRef.current === id) return;
    lastHydratedLoanIdRef.current = id;
    const cur = coerceCurrency(operation.currency);
    setCurrency(cur);
    setFrequency(apiFrequencyToForm(operation.frequency));
    reset({
      amount: amountToMoneyInputString(operation.principalAmount, cur),
      interest: String(operation.interestRate),
      startDate: new Date(operation.startDate),
    });
  }, [operation, id, reset]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateOperationData) =>
      updateOperation(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'loan', id] });
      queryClient.invalidateQueries({ queryKey: ['operations', 'loans'] });
      showSuccess(
        t('operations.editLoan'),
        t('operations.editLoanSuccess')
      );
      router.back();
    },
    onError: (error: unknown) => {
      const apiMessage = getTranslatedError(
        error as ApiError | Error,
        t('common.errors.UNKNOWN_ERROR')
      );
      showError(t('common.error'), apiMessage);
    },
  });

  const onSave = (data: EditLoanFields) => {
    if (!operation) return;
    const startOk = data.startDate;
    const dueDateObj = dueDateFromLoanStart(startOk, frequency);

    const payload: UpdateOperationData = {
      principalAmount: parseAmount(data.amount),
      currency,
      interestRate: parseInterest(data.interest),
      startDate: startOk.toISOString(),
      dueDate: dueDateObj.toISOString(),
      frequency: formFrequencyToApi(frequency),
    };

    if (operation.title?.trim()) {
      payload.title = operation.title;
    }
    if (operation.description?.trim()) {
      payload.description = operation.description;
    }

    mutation.mutate(payload);
  };

  const clientName =
    operation?.client?.name ?? (operation ? `#${operation.clientId}` : '');

  if (!id) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <Typography color="text">{t('operations.loanLoadError')}</Typography>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  if (isError || !operation) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>
        <View style={styles.centered}>
          <Typography color="text">{t('operations.loanLoadError')}</Typography>
          <Button
            variant="outline"
            onPress={() => refetch()}
            style={{ marginTop: 16 }}
          >
            {t('common.toast.tryAgain')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <BackButton />
          <Typography
            variant="h4"
            style={styles.headerTitle}
          >
            {t('operations.editLoan')}
          </Typography>
        </View>
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
        <View style={[styles.clientCard, { borderColor: colors.border }]}>
          <Avatar
            icon="user-filled"
            size={40}
            backgroundColor="muted"
            iconColor="icon"
            image={operation.client?.profilePictureUrl}
          />
          <Typography
            variant="body1Medium"
            style={styles.clientName}
          >
            {clientName}
          </Typography>
        </View>

        <View style={styles.currencyRow}>
          <View style={styles.currencySelect}>
            <Typography
              variant="body2Medium"
              style={[styles.fieldLabel, { color: colors.text }]}
            >
              {t('operations.currency')}
            </Typography>
            <Select
              options={currencyOptions}
              value={currency}
              onValueChange={(v) => setCurrency(coerceCurrency(v))}
            />
          </View>
          <View style={styles.amountInput}>
            <MoneyInput
              control={control}
              name="amount"
              label={t('operations.amount')}
              placeholder="0,00"
              currency={currency}
              error={errors.amount?.message}
            />
          </View>
        </View>

        <Input
          control={control}
          name="interest"
          type="percentage"
          label={t('operations.interest')}
          placeholder="0"
          keyboardType="decimal-pad"
          error={errors.interest?.message}
        />

        <View style={styles.dateField}>
          <DatePicker
            mode="date"
            control={control}
            name="startDate"
            label={t('operations.loanDate')}
            placeholder={t('operations.today')}
            error={errors.startDate?.message}
          />
        </View>

        <View style={styles.frequencyField}>
          <Typography
            variant="body2Medium"
            style={[styles.fieldLabel, { color: colors.text }]}
          >
            {t('operations.frequency')}
          </Typography>
          <Select
            options={frequencyOptions}
            value={frequency}
            onValueChange={(v) => setFrequency(v as LoanFormFrequency)}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleSubmit(onSave)}
          disabled={!isValid || mutation.isPending}
        >
          {mutation.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
  },
  headerRight: {
    width: 80,
    minWidth: 80,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 20,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  clientName: {
    flex: 1,
    fontSize: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  currencySelect: {
    width: 130,
    gap: 1,
  },
  amountInput: { flex: 1 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  dateField: { position: 'relative' },
  frequencyField: {
    gap: 6,
    zIndex: 5,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
