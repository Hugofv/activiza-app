import React, { useEffect, useMemo } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/BottomSheet';
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

function toCurrencyCode(currency: string): CurrencyCode {
  const u = (currency || 'GBP').toUpperCase();
  if (u === 'BRL' || u === 'USD' || u === 'GBP' || u === 'EUR') return u;
  return 'GBP';
}

interface FormValues {
  amount: string;
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
    defaultValues: { amount: '' },
  });

  const amountStr = watch('amount');
  const parsedAmount = useMemo(
    () => parseMoneyValue(amountStr || '', currencyCode),
    [amountStr, currencyCode]
  );

  const canSubmit =
    parsedAmount > 0 && parsedAmount <= amountReceivable + 0.000001;

  useEffect(() => {
    if (visible) {
      reset({ amount: '' });
    }
  }, [visible, reset]);

  const mutation = useMutation({
    mutationFn: (amount: number) =>
      registerLoanPayment(operationId, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', 'loans'] });
      queryClient.invalidateQueries({
        queryKey: ['operations', 'loan', operationId],
      });
      showSuccess(t('operations.paymentRegistered'));
      reset({ amount: '' });
      onClose();
    },
    onError: (err: unknown) => {
      showApiError(err instanceof Error ? err : new Error(String(err)));
    },
  });

  const onSubmit = () => {
    if (!canSubmit) return;
    mutation.mutate(parsedAmount);
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

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      minHeight={360}
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
        <View
          style={[styles.amountUnderline, { backgroundColor: colors.border }]}
        />

        <View style={styles.chips}>
          <Pressable
            onPress={applyMinimum}
            style={({ pressed }) => [
              styles.chip,
              styles.chipOutline,
              { borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Typography
              variant="body2Medium"
              style={{ color: colors.primary }}
            >
              {t('operations.minimum')}
            </Typography>
          </Pressable>
          <Pressable
            onPress={applyTotal}
            style={({ pressed }) => [
              styles.chip,
              styles.chipFilled,
              { backgroundColor: colors.muted },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Typography
              variant="body2Medium"
              color="placeholder"
            >
              {t('operations.total')}
            </Typography>
          </Pressable>
        </View>

        <View style={styles.footerRow}>
          <View style={{ flex: 1 }} />
          <IconButton
            variant="primary"
            shape="rounded"
            size="md"
            icon="arrow-forward"
            iconSize={28}
            iconColor={colors.primaryForeground}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit || mutation.isPending}
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
    gap: 8,
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
  chips: { flexDirection: 'row', gap: 12, marginBottom: 24 },
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
    flexDirection: 'row',
    alignItems: 'center',
  },
});
