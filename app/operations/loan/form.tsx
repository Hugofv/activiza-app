import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { type CurrencyCode, MoneyInput } from '@/components/ui/MoneyInput';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

import { DatePicker } from '@/components/ui/DatePicker';
import { type FrequencyType, useOperations } from '../_context';

interface LoanFormFields {
  amount: string;
  interest: string;
  dueDate: string;
  observation: string;
}

export default function LoanFormScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const keyboardHeight = useKeyboardHeight();
  const { formData, updateFormData } = useOperations();

  const currencyOptions: SelectOption[] = [
    {
      value: 'GBP',
      label: '£ GBP',
    },
    {
      value: 'USD',
      label: '$ USD',
    },
    {
      value: 'BRL',
      label: 'R$ BRL',
    },
    {
      value: 'EUR',
      label: '€ EUR',
    },
  ];

  const frequencyOptions: SelectOption[] = [
    {
      value: 'weekly',
      label: t('operations.weekly'),
    },
    {
      value: 'biweekly',
      label: t('operations.biweekly'),
    },
    {
      value: 'monthly',
      label: t('operations.monthly'),
    },
  ];

  const loanSchema = yup.object().shape({
    amount: yup
      .string()
      .required(`${t('operations.amount')} ${t('common.validation.required')}`)
      .test('positive', t('operations.invalidValue'), (v) => {
        const n = parseFloat((v ?? '').replace(/\D/g, '').replace(',', '.'));
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
    dueDate: yup.string().optional().default(''),
    observation: yup.string().optional().default(''),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoanFormFields>({
    resolver: yupResolver(loanSchema) as any,
    defaultValues: {
      amount: formData.amount || '',
      interest: formData.interest || '',
      dueDate: formData.dueDate || '',
      observation: formData.observation || '',
    },
    mode: 'onChange',
  });

  const handleCurrencyChange = (value: string) => {
    updateFormData({ currency: value });
  };

  const handleFrequencyChange = (value: string) => {
    updateFormData({ frequency: value as FrequencyType });
  };

  const onNext = (data: LoanFormFields) => {
    updateFormData({
      amount: data.amount,
      interest: data.interest,
      dueDate: data.dueDate || '',
      observation: data.observation || '',
    });
    router.push('/operations/loan/summary');
  };

  const handleEditClient = () => {
    router.back();
  };

  console.log(formData);
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <BackButton />
          <Typography
            variant="h4"
            style={styles.headerTitle}
          >
            {t('operations.lendLoan')}
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
        {/* Selected client */}
        <Pressable
          style={[styles.clientCard, { borderColor: colors.border }]}
          onPress={handleEditClient}
        >
          <Avatar
            icon="user-filled"
            size={40}
            backgroundColor="muted"
            iconColor="icon"
            image={formData.client?.profilePictureUrl}
          />
          <Typography
            variant="body1Medium"
            style={styles.clientName}
          >
            {formData.client?.name || t('operations.selectClient')}
          </Typography>
          <IconButton
            icon="pencil"
            size="sm"
            variant="ghost"
            onPress={handleEditClient}
          />
        </Pressable>

        {/* Currency + Amount row */}
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
              value={formData.currency}
              onValueChange={handleCurrencyChange}
            />
          </View>
          <View style={styles.amountInput}>
            <MoneyInput
              control={control}
              name="amount"
              label={t('operations.amount')}
              placeholder="0,00"
              currency={(formData.currency as CurrencyCode) || 'BRL'}
              error={errors.amount?.message}
            />
          </View>
        </View>

        {/* Interest */}
        <Input
          control={control}
          name="interest"
          type="percentage"
          label={t('operations.interest')}
          placeholder="0"
          keyboardType="decimal-pad"
          error={errors.interest?.message}
        />

        {/* Due Date */}
        <View style={styles.dateField}>
          <DatePicker
            mode="date"
            control={control}
            name="dueDate"
            value={new Date(formData.dueDate)}
            label={t('operations.dueDate')}
            placeholder={t('operations.today')}
            error={errors.dueDate?.message}
          />
        </View>

        {/* Frequency */}
        <View style={styles.frequencyField}>
          <Typography
            variant="body2Medium"
            style={[styles.fieldLabel, { color: colors.text }]}
          >
            {t('operations.frequency')}
          </Typography>
          <Select
            options={frequencyOptions}
            value={formData.frequency}
            onValueChange={handleFrequencyChange}
          />
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleSubmit(onNext)}
          disabled={!isValid}
        >
          {t('operations.next')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  dateIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
  },
  frequencyField: {
    gap: 6,
    zIndex: 5,
  },
  alertsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
