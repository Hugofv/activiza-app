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
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type OperationHistoryEntry,
  formatOperationCurrency,
  getOperationById,
  getOperationHistory,
} from '@/lib/services/operationService';
import { formatDate } from '@/lib/utils/dateFormat';

const PAGE = 1;
const PAGE_SIZE = 50;

const KNOWN_HISTORY_REASONS = new Set([
  'CREATED',
  'UPDATED',
  'DELETED',
  'PAYMENT',
  'COMPLETED',
  'CONTRACT_EVALUATION',
  'MANUAL',
]);

function historyReasonKey(reason: string): string {
  if (KNOWN_HISTORY_REASONS.has(reason)) {
    return `operations.historyReason.${reason}`;
  }
  return 'operations.historyReason.OTHER';
}

function historyEntryTitle(entry: OperationHistoryEntry, t: TFunction): string {
  if (entry.reason !== 'PAYMENT') {
    return t(historyReasonKey(String(entry.reason)));
  }
  const settlement = entry.payment?.meta?.contractSettlement?.toUpperCase();
  if (settlement === 'FULL') return t('operations.fullPayment');
  if (settlement === 'PARTIAL') return t('operations.partialPayment');
  return t('operations.historyPayment');
}

function entryDisplayAmount(entry: OperationHistoryEntry): number | null {
  if (entry.reason !== 'PAYMENT') return null;
  if (entry.payment != null) return entry.payment.amount;
  const delta = Math.abs(entry.previousAmount - entry.newAmount);
  return delta > 0 ? delta : null;
}

function entryDisplayDateIso(entry: OperationHistoryEntry): string {
  if (entry.reason === 'PAYMENT' && entry.payment?.paidAt) {
    return entry.payment.paidAt;
  }
  return entry.createdAt;
}

function entrySubtitle(
  entry: OperationHistoryEntry,
  currency: string
): string | null {
  if (entry.reason === 'PAYMENT') return null;
  const a = formatOperationCurrency(entry.previousAmount, currency);
  const b = formatOperationCurrency(entry.newAmount, currency);
  return `${a} → ${b}`;
}

export default function LoanOperationHistoryScreen() {
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
    data: historyData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['operations', 'loan', id, 'history', PAGE, PAGE_SIZE],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: () =>
      getOperationHistory(id!, { page: PAGE, limit: PAGE_SIZE }),
    enabled: !!id,
  });

  const results = historyData?.results ?? [];
  const currency = operation?.currency ?? 'GBP';

  const renderItem = useCallback(
    ({ item }: { item: OperationHistoryEntry }) => {
      const title = historyEntryTitle(item, t);
      const amount = entryDisplayAmount(item);
      const subtitle = entrySubtitle(item, currency);
      const dateIso = entryDisplayDateIso(item);
      const dateLabel =
        dateIso && !Number.isNaN(new Date(dateIso).getTime())
          ? formatDate(dateIso, 'dd/MM/yyyy')
          : '—';

      const iconName = item.reason === 'PAYMENT' ? 'receipt-2' : 'history';

      return (
        <View
          style={[styles.row, { borderBottomColor: colors.border }]}
        >
          <Icon
            name={iconName}
            size={24}
            color="icon"
            style={styles.rowIcon}
          />
          <View style={styles.rowMain}>
            <Typography variant="body1SemiBold">{title}</Typography>
            {amount != null && (
              <Typography variant="h6Medium">
                {formatOperationCurrency(
                  amount,
                  item.payment?.currency ?? currency
                )}
              </Typography>
            )}
            {subtitle != null && (
              <Typography
                variant="body2"
                color="placeholder"
              >
                {subtitle}
              </Typography>
            )}
            {item.reason !== 'PAYMENT' && item.actor ? (
              <Typography
                variant="caption"
                color="placeholder"
                numberOfLines={1}
              >
                {item.actor}
              </Typography>
            ) : null}
          </View>
          <Typography
            variant="body2"
            color="placeholder"
            style={styles.rowDate}
          >
            {dateLabel}
          </Typography>
        </View>
      );
    },
    [colors.border, currency, t]
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
            {t('operations.operationHistory')}
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
            {t('operations.operationHistory')}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <Typography color="text">
            {t('operations.historyLoadError')}
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
          {t('operations.operationHistory')}
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => String(item.id ?? `hist-${index}`)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Typography
            variant="body2"
            color="placeholder"
            style={styles.empty}
          >
            {t('operations.historyEmpty')}
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
    alignItems: 'flex-start',
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
