import React, { useCallback } from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type LoanPayment,
  formatOperationCurrency,
  getOperationById,
  getOperationPayments,
} from '@/lib/services/operationService';
import { formatDate } from '@/lib/utils/dateFormat';

const PAGE_SIZE = 50;

function isFullPaymentRow(p: LoanPayment): boolean {
  if (p.isFullPayment === true) return true;
  if (p.isFullPayment === false) return false;
  if (p.type === 'FULL' || p.type === 'full') return true;
  if (p.type === 'PARTIAL' || p.type === 'partial') return false;
  return false;
}

export default function LoanPaymentsHistoryScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: operation } = useQuery({
    queryKey: ['operations', 'loan', id],
    queryFn: () => getOperationById(id!),
    enabled: !!id,
  });

  const {
    data: paymentsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['operations', 'loan', id, 'payments', 1, PAGE_SIZE],
    queryFn: () =>
      getOperationPayments(id!, { page: 1, limit: PAGE_SIZE }),
    enabled: !!id,
  });

  const results = paymentsData?.results ?? [];
  const currency = operation?.currency ?? 'GBP';

  const paymentTitle = useCallback(
    (p: LoanPayment) => {
      if (isFullPaymentRow(p)) return t('operations.fullPayment');
      return t('operations.partialPayment');
    },
    [t]
  );

  const renderItem = useCallback(
    ({ item }: { item: LoanPayment }) => (
      <View
        style={[styles.row, { borderBottomColor: colors.border }]}
      >
        <Icon
          name="receipt-2"
          size={24}
          color="icon"
          style={styles.rowIcon}
        />
        <View style={styles.rowMain}>
          <Typography variant="body1SemiBold">{paymentTitle(item)}</Typography>
          <Typography variant="h6Medium">
            {formatOperationCurrency(
              item.amount,
              item.currency ?? currency
            )}
          </Typography>
        </View>
        <Typography
          variant="body2"
          color="placeholder"
          style={styles.rowDate}
        >
          {formatDate(item.paidAt, 'dd/MM/yyyy')}
        </Typography>
      </View>
    ),
    [colors.border, currency, paymentTitle]
  );

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
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Typography
            variant="h4"
            style={styles.headerTitle}
          >
            {t('operations.paymentHistory')}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
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
            {t('operations.paymentHistory')}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <Typography color="text">
            {t('operations.paymentsLoadError')}
          </Typography>
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
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Typography
          variant="h4"
          style={styles.headerTitle}
        >
          {t('operations.paymentHistory')}
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          String(item.id ?? `payment-${index}`)
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <Typography
            variant="body2"
            color="placeholder"
            style={styles.empty}
          >
            {t('operations.loanHistoryEmpty')}
          </Typography>
        }
        contentContainerStyle={
          results.length === 0 ? styles.listEmptyContent : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  listEmptyContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowIcon: { marginTop: 2 },
  rowMain: { flex: 1, gap: 4 },
  rowDate: { alignSelf: 'flex-start', marginTop: 2 },
  empty: {
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
});
