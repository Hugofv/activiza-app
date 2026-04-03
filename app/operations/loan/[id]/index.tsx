import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useQuery } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoanStatusBadge } from '@/components/operations/LoanStatusBadge';
import { RegisterPaymentBottomSheet } from '@/components/operations/RegisterPaymentBottomSheet';
import { Avatar } from '@/components/ui/Avatar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import ListItemIcon from '@/components/ui/ListItemIcon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/lib/hooks/useToast';
import {
  type FrequencyType,
  formatOperationCurrency,
  getOperationById,
  getOperationRemainingToReceive,
} from '@/lib/services/operationService';
import { formatDate, formatDateWithDay } from '@/lib/utils/dateFormat';

const FREQUENCY_KEY: Record<FrequencyType, string> = {
  WEEKLY: 'operations.weeklyContract',
  BIWEEKLY: 'operations.biweeklyContract',
  MONTHLY: 'operations.monthlyContract',
};

export default function LoanDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { showInfo } = useToast();

  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);

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

  /** Balance still to receive (API `remainingToReceive` / `remaining_to_receive`). */
  const remainingToReceive = useMemo(() => {
    if (!operation) return 0;
    return getOperationRemainingToReceive(operation);
  }, [operation]);

  const profitAmount = useMemo(() => {
    if (!operation) return 0;
    return operation.principalAmount * (operation.interestRate / 100);
  }, [operation]);

  const minimumPayment = useMemo(() => {
    if (!operation) return 0;
    const p = profitAmount;
    if (p > 0) return Math.min(p, remainingToReceive);
    return 0;
  }, [operation, profitAmount, remainingToReceive]);

  const frequencyLabel = useMemo(() => {
    if (!operation) return '';
    return t(
      FREQUENCY_KEY[operation.frequency] ?? 'operations.monthlyContract'
    );
  }, [operation, t]);

  const clientName =
    operation?.client?.name ?? (operation ? `#${operation.clientId}` : '');

  if (!id) {
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
        </View>
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

  const contractTitle =
    operation.title?.trim() ||
    t('operations.contractTitleFallback', { id: operation.id });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Typography
          variant="h4"
          style={styles.headerTitle}
        >
          {t('operations.loanScreenTitle')}
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <LoanStatusBadge
            operation={operation}
            style={{
              width: '100%',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              alignItems: 'center',
            }}
          />

          <Typography
            variant="h3Bold"
            style={styles.contractHeading}
          >
            {contractTitle}
          </Typography>

          <View style={styles.rowIcon}>
            <Icon
              name="pig"
              size={22}
              color="icon"
            />
            <View style={styles.rowText}>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('operations.nextPayment')}
              </Typography>
              <View style={styles.rowAmount}>
                <Typography
                  variant="h4"
                  style={{ fontSize: 40 }}
                >
                  {formatOperationCurrency(
                    remainingToReceive,
                    operation.currency
                  )}
                </Typography>
                <Typography
                  variant="body1"
                  color="placeholder"
                >
                  {formatDate(operation.dueDate, 'dd/MM/yyyy')}
                </Typography>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.rowIcon}>
            <Icon
              name="user-circle"
              size={22}
              color="icon"
            />
            <View style={styles.rowText}>
              <Typography
                variant="body2"
                color="placeholder"
              >
                {t('operations.client')}
              </Typography>
              <View style={styles.clientRow}>
                <Avatar
                  image={operation.client?.profilePictureUrl}
                  icon="user"
                  size={36}
                />
                <Typography
                  variant="body1Medium"
                  style={styles.clientName}
                >
                  {clientName}
                </Typography>
              </View>
            </View>
          </View>

          <View style={[styles.metrics, { backgroundColor: colors.muted }]}>
            <View style={styles.metric}>
              <View style={styles.metricHeader}>
                <Icon
                  name="cash-outline"
                  size={20}
                  color="icon"
                />
                <Typography
                  variant="caption"
                  color="placeholder"
                >
                  {t('operations.amount')}
                </Typography>
              </View>
              <Typography variant="body1SemiBold">
                {formatOperationCurrency(
                  operation.principalAmount,
                  operation.currency
                )}
              </Typography>
            </View>
            <View style={styles.metric}>
              <View style={styles.metricHeader}>
                <Icon
                  name="percentage"
                  size={20}
                  color="icon"
                />
                <Typography
                  variant="caption"
                  color="placeholder"
                >
                  {t('operations.interestMetric')}
                </Typography>
              </View>
              <Typography variant="body1SemiBold">
                {operation.interestRate}%
              </Typography>
            </View>
            <View style={styles.metric}>
              <View style={styles.metricHeader}>
                <Icon
                  name="chart-line"
                  size={20}
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
                {formatOperationCurrency(profitAmount, operation.currency)}
              </Typography>
            </View>
          </View>

          <ListItemIcon
            icon="calendar"
            label={t('operations.loanDate')}
            value={formatDateWithDay(new Date(operation.startDate))}
          />
          <ListItemIcon
            icon="reload"
            label={t('operations.frequency')}
            value={frequencyLabel}
          />
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            style={[styles.actionTile, { borderColor: colors.border }]}
            onPress={() =>
              router.push(`/operations/loan/${id}/payments` as any)
            }
          >
            <Icon
              name="history"
              size={28}
              color="primaryForeground"
            />
            <Typography
              variant="caption"
              style={styles.actionLabel}
            >
              {t('operations.paymentHistory')}
            </Typography>
          </Pressable>
          <Pressable
            style={[styles.actionTile, { borderColor: colors.border }]}
            onPress={() => showInfo(t('operations.featureComingSoon'))}
          >
            <Icon
              name="note"
              size={28}
              color="primaryForeground"
            />
            <Typography
              variant="caption"
              style={styles.actionLabel}
            >
              {t('operations.alerts')}
            </Typography>
          </Pressable>
          <Pressable
            style={[styles.actionTile, { borderColor: colors.border }]}
            onPress={() => showInfo(t('operations.featureComingSoon'))}
          >
            <Icon
              name="trash"
              size={28}
              color="error"
            />
            <Typography
              variant="caption"
              style={styles.actionLabel}
            >
              {t('operations.loanActionDelete')}
            </Typography>
          </Pressable>
        </View>
      </ScrollView>

      {operation.status !== 'COMPLETED' ? (
        <View style={styles.footer}>
          <Button
            variant="primary"
            size="full"
            onPress={() => setPaymentSheetOpen(true)}
          >
            {t('operations.registerPayment')}
          </Button>
          <Button
            variant="outline"
            size="full"
            onPress={() => showInfo(t('operations.featureComingSoon'))}
            style={styles.footerSecondary}
          >
            {t('operations.finalizeContract')}
          </Button>
        </View>
      ) : null}

      <RegisterPaymentBottomSheet
        visible={paymentSheetOpen}
        onClose={() => setPaymentSheetOpen(false)}
        operationId={String(operation.id)}
        currency={operation.currency}
        amountReceivable={remainingToReceive}
        minimumAmount={minimumPayment}
      />
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  contractHeading: { marginBottom: 4 },
  rowIcon: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rowText: { flex: 1, gap: 4 },
  rowAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  clientName: { flex: 1 },
  divider: { height: 1, width: '100%' },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 8,
  },
  metric: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  metricHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
    alignItems: 'center',
    gap: 4,
  },
  metaLine: { marginTop: 4 },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionTile: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 110,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  actionLabel: { textAlign: 'center' },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12,
  },
  footerSecondary: { marginTop: 0 },
});
