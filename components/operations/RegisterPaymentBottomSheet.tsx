import React, { useEffect, useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { DatePicker } from '@/components/ui/DatePicker';
import { IconButton } from '@/components/ui/IconButton';
import {
  MoneyInput,
  amountToMoneyInputString,
  getCurrencySymbol,
  parseMoneyValue,
  type CurrencyCode,
} from '@/components/ui/MoneyInput';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import {
  formatOperationCurrency,
  registerLoanPayment,
} from '@/lib/services/operationService';
import { Button } from '../ui/Button';

function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function toCurrencyCode(currency: string): CurrencyCode {
  const u = (currency || 'GBP').toUpperCase();
  if (u === 'BRL' || u === 'USD' || u === 'GBP' || u === 'EUR') return u;
  return 'GBP';
}

interface FormValues {
  amount: string;
  paidAt: Date;
}

export interface RegisterPaymentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  operationId: string;
  currency: string;
  /** Full amount due (principal + interest), major units */
  amountReceivable: number;
  /** Suggested minimum installment (e.g. interest portion), major units */
  minimumAmount: number;
}

export function RegisterPaymentBottomSheet({
  visible,
  onClose,
  operationId,
  currency,
  amountReceivable,
  minimumAmount,
}: RegisterPaymentBottomSheetProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const { showSuccess, showApiError } = useToast();

  const currencyCode = useMemo(() => toCurrencyCode(currency), [currency]);

  const { control, reset, watch, setValue, handleSubmit } = useForm<FormValues>({
    defaultValues: { amount: '', paidAt: startOfTodayLocal() },
  });

  const amountStr = watch('amount');
  const paidAtValue = watch('paidAt');
  const parsedAmount = useMemo(
    () => parseMoneyValue(amountStr || '', currencyCode),
    [amountStr, currencyCode]
  );

  const canSubmit =
    parsedAmount > 0 && parsedAmount <= amountReceivable + 0.000001;

  useEffect(() => {
    if (visible) {
      reset({ amount: '', paidAt: startOfTodayLocal() });
    }
  }, [visible, reset]);

  const mutation = useMutation({
    mutationFn: (vars: { amount: number; paidAt: Date }) =>
      registerLoanPayment(operationId, {
        amount: vars.amount,
        paidAt: vars.paidAt.toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'loans'] });
      queryClient.invalidateQueries({
        queryKey: ['operations', 'loan', operationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['operations', 'loan', operationId, 'history'],
      });
      showSuccess(t('operations.paymentRegistered'));
      reset({ amount: '', paidAt: startOfTodayLocal() });
      onClose();
    },
    onError: (err: unknown) => {
      showApiError(err instanceof Error ? err : new Error(String(err)));
    },
  });

  const onSubmit = (data: FormValues) => {
    const parsed = parseMoneyValue(data.amount || '', currencyCode);
    const ok =
      parsed > 0 &&
      parsed <= amountReceivable + 0.000001 &&
      data.paidAt instanceof Date &&
      !Number.isNaN(data.paidAt.getTime());
    if (!ok) return;
    mutation.mutate({ amount: parsed, paidAt: data.paidAt });
  };

  const applyMinimum = () => {
    const m = Math.min(Math.max(minimumAmount, 0), amountReceivable);
    if (m > 0) {
      setValue('amount', amountToMoneyInputString(m, currencyCode), {
        shouldDirty: true,
      });
    }
  };

  const applyTotal = () => {
    if (amountReceivable > 0) {
      setValue(
        'amount',
        amountToMoneyInputString(amountReceivable, currencyCode),
        { shouldDirty: true }
      );
    }
  };

  const moneyPlaceholder = currencyCode === 'BRL' ? '0,00' : '0.00';

  const maxDate = useMemo(() => endOfTodayLocal(), []);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      minHeight={440}
      maxHeightRatio={0.85}
    >
      <View style={styles.sheetInner}>
        <Typography
          variant="h4"
          style={styles.sheetTitle}
        >
          {t('operations.registerPayment')}
        </Typography>
        <Typography
          variant="body2"
          color="placeholder"
          style={styles.subtitle}
        >
          {t('operations.toReceive', {
            amount: formatOperationCurrency(amountReceivable, currency),
          })}
        </Typography>

        <View style={styles.amountRow}>
          <Typography
            variant="h3"
            color="text"
            style={styles.currencyGlyph}
          >
            {getCurrencySymbol(currencyCode)}
          </Typography>
          <View style={styles.moneyWrap}>
            <MoneyInput
              control={control}
              name="amount"
              currency={currencyCode}
              placeholder={moneyPlaceholder}
              className="border-0 rounded-none px-0 py-2 font-medium text-2xl"
            />
          </View>
        </View>

        <View style={styles.chips}>
          <Button variant="primary" size="sm" onPress={applyMinimum}>
            {t('operations.minimum')}
          </Button>
          <Button variant="outline" size="sm" onPress={applyTotal}>
            {t('operations.total')}
          </Button>
        </View>

        <DatePicker
          mode="date"
          control={control}
          name="paidAt"
          label={t('operations.paymentDate')}
          placeholder={t('operations.today')}
          maximumDate={maxDate}
        />

        <View style={styles.footerRow}>
          <View style={{ flex: 1 }} />
          <IconButton
            variant="primary"
            size="md"
            icon="arrow-forward"
            iconSize={28}
            iconColor={colors.primaryForeground}
            onPress={handleSubmit(onSubmit)}
            disabled={
              !canSubmit ||
              !paidAtValue ||
              !(paidAtValue instanceof Date) ||
              Number.isNaN(paidAtValue.getTime()) ||
              mutation.isPending
            }
            loading={mutation.isPending}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetInner: { paddingBottom: 24, gap: 8 },
  sheetTitle: { marginTop: 4 },
  subtitle: { marginBottom: 12 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  currencyGlyph: { marginBottom: 4 },
  moneyWrap: { flex: 1 },
  amountUnderline: {
    height: 1,
    width: '100%',
    marginTop: -4,
    marginBottom: 16,
  },
  chips: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipOutline: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipFilled: {},
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
