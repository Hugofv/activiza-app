import { useMemo, useState } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';

import { useOperations } from '../_context';

export default function LoanSummaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { showSuccess } = useToast();
  const { formData, resetOperation } = useOperations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = useMemo(() => {
    switch (formData.currency) {
    case 'GBP':
      return '£';
    case 'USD':
      return '$';
    case 'BRL':
      return 'R$';
    case 'EUR':
      return '€';
    default:
      return '£';
    }
  }, [formData.currency]);

  const amountNum = useMemo(() => {
    const n = parseFloat(
      (formData.amount || '0').replace(/\D/g, '').replace(',', '.')
    );
    return isNaN(n) ? 0 : n;
  }, [formData.amount]);

  const interestNum = useMemo(() => {
    const n = parseFloat((formData.interest || '0').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }, [formData.interest]);

  const profit = useMemo(
    () => Math.round(amountNum * (interestNum / 100)),
    [amountNum, interestNum]
  );

  const totalReceivable = useMemo(
    () => amountNum + profit,
    [amountNum, profit]
  );

  const frequencyLabel = useMemo(() => {
    switch (formData.frequency) {
    case 'weekly':
      return t('operations.weekly');
    case 'biweekly':
      return t('operations.biweekly');
    case 'monthly':
      return t('operations.monthly');
    default:
      return formData.frequency;
    }
  }, [formData.frequency, t]);

  const today = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, []);

  const nextPaymentDate = useMemo(() => {
    const d = new Date();
    switch (formData.frequency) {
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [formData.frequency]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // TODO: call loan API when endpoint exists
      showSuccess(
        t('operations.createLoan'),
        t('operations.lendLoanDescription')
      );
      resetOperation();
      router.dismissAll();
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (value: number) =>
    `${value.toLocaleString()}${currencySymbol}`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <BackButton />
        </View>
        <Typography
          variant="h4"
          style={styles.headerTitle}
        >
          {t('operations.lendLoan')}
        </Typography>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[styles.card, { borderColor: colors.border }]}>
          {/* Title */}
          <Typography
            variant="body1SemiBold"
            style={[styles.cardTitle, { color: colors.text }]}
          >
            {t('operations.contractSummary')}
          </Typography>

          {/* Client */}
          <View style={styles.row}>
            <Icon
              name="user-circle"
              size={20}
              color="icon"
            />
            <View>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('operations.client')}
              </Typography>
              <Typography
                variant="body1SemiBold"
                color="text"
              >
                {formData.selectedClientName}
              </Typography>
            </View>
          </View>

          {/* Amount / Interest / Profit row */}
          <View style={[styles.statsRow, { backgroundColor: colors.muted }]}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Icon
                  name="currency-pound"
                  size={14}
                  color="icon"
                />
                <Typography
                  variant="caption"
                  color="placeholder"
                >
                  {t('operations.amount')}
                </Typography>
              </View>
              <Typography
                variant="body1SemiBold"
                color="text"
              >
                {formatAmount(amountNum)}
              </Typography>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Icon
                  name="percentage"
                  size={14}
                  color="icon"
                />
                <Typography
                  variant="caption"
                  color="placeholder"
                >
                  {t('operations.interest')}
                </Typography>
              </View>
              <Typography
                variant="body1SemiBold"
                color="text"
              >
                {interestNum}%
              </Typography>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Icon
                  name="chart-line"
                  size={14}
                  color="icon"
                />
                <Typography
                  variant="caption"
                  color="placeholder"
                >
                  {t('operations.profit')}
                </Typography>
              </View>
              <Typography
                variant="body1SemiBold"
                color="text"
              >
                {formatAmount(profit)}
              </Typography>
            </View>
          </View>

          {/* Loan Date */}
          <View style={styles.row}>
            <Icon
              name="calendar"
              size={20}
              color="icon"
            />
            <View>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('operations.loanDate')}
              </Typography>
              <Typography
                variant="body1SemiBold"
                color="text"
              >
                {t('operations.today')} ({formData.dueDate || today})
              </Typography>
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.row}>
            <Icon
              name="refresh"
              size={20}
              color="icon"
            />
            <View>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('operations.frequency')}
              </Typography>
              <Typography
                variant="body1SemiBold"
                color="text"
              >
                {frequencyLabel}
              </Typography>
            </View>
          </View>

          {/* Next Payment */}
          <View style={styles.row}>
            <Icon
              name="clock"
              size={20}
              color="icon"
            />
            <View style={styles.paymentInfo}>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('operations.nextPayment')}
              </Typography>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {nextPaymentDate}
              </Typography>
            </View>
          </View>

          {/* Total Receivable */}
          <Typography
            variant="h3"
            style={[styles.totalAmount, { color: colors.primary }]}
          >
            {formatAmount(totalReceivable)}
          </Typography>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleConfirm}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t('operations.confirm')}
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
    width: 80,
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 80,
    minWidth: 80,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'left',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
