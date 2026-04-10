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
  type FrequencyType,
  type OperationHistoryEntry,
  type OperationStatus,
  formatOperationCurrency,
  getOperationById,
  getOperationHistory,
} from '@/lib/services/operationService';
import { formatDate } from '@/lib/utils/dateFormat';

const PAGE = 1;
const PAGE_SIZE = 50;

const FREQUENCY_I18N_KEY: Record<FrequencyType, string> = {
  DAILY: 'operations.dailyContract',
  WEEKLY: 'operations.weeklyContract',
  BIWEEKLY: 'operations.biweeklyContract',
  MONTHLY: 'operations.monthlyContract',
};

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

/** Event column: date-only for audit rows; date + time for payments when the ISO includes or implies a time. */
function entryEventDatePattern(entry: OperationHistoryEntry): string {
  if (entry.reason !== 'PAYMENT') return 'dd/MM/yyyy';
  const iso = entryDisplayDateIso(entry);
  if (!iso || Number.isNaN(new Date(iso).getTime())) return 'dd/MM/yyyy';
  return /T\d{2}:\d{2}/.test(iso) ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
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

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function entryMetadataSnapshot(
  entry: OperationHistoryEntry
): Record<string, unknown> | null {
  const meta = entry.metadata;
  if (!isPlainRecord(meta)) return null;
  const snapshot = meta.snapshot;
  return isPlainRecord(snapshot) ? snapshot : null;
}

function snapshotStringField(
  snapshot: Record<string, unknown>,
  camel: string,
  snake: string
): string | null {
  const raw = snapshot[camel] ?? snapshot[snake];
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function snapshotIsoDate(
  snapshot: Record<string, unknown>,
  camel: string,
  snake: string
): string | null {
  const raw = snapshotStringField(snapshot, camel, snake);
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? null : raw;
}

function snapshotNumber(
  snapshot: Record<string, unknown>,
  camel: string,
  snake: string
): number | null {
  const raw = snapshot[camel] ?? snapshot[snake];
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number(raw.replace(',', '.'));
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function snapshotFrequency(
  snapshot: Record<string, unknown>
): FrequencyType | null {
  const raw = snapshotStringField(snapshot, 'frequency', 'frequency_type');
  if (!raw) return null;
  const u = raw.toUpperCase() as FrequencyType;
  return u in FREQUENCY_I18N_KEY ? u : null;
}

function snapshotStatusLabel(status: string, t: TFunction): string {
  const u = status.toUpperCase() as OperationStatus | string;
  if (u === 'COMPLETED') return t('operations.statusFinalized');
  if (u === 'CANCELLED') return t('operations.statusCancelled');
  if (u === 'OVERDUE') return t('operations.statusOverdue');
  if (u === 'ACTIVE') return t('operations.inProgress');
  return status;
}

function formatSnapshotDetailLines(
  entry: OperationHistoryEntry,
  t: TFunction,
  currency: string
): string[] {
  if (entry.reason === 'PAYMENT') return [];
  const snap = entryMetadataSnapshot(entry);
  if (!snap) return [];

  const lines: string[] = [];

  const statusRaw = snapshotStringField(snap, 'status', 'status');
  if (statusRaw) {
    lines.push(
      `${t('operations.historySnapshotStatus')}: ${snapshotStatusLabel(statusRaw, t)}`
    );
  }

  const startIso = snapshotIsoDate(snap, 'startDate', 'start_date');
  const freq = snapshotFrequency(snap);
  const startLabel = startIso
    ? formatDate(startIso, 'dd/MM/yyyy')
    : null;
  const freqLabel = freq ? t(FREQUENCY_I18N_KEY[freq]) : null;
  if (startLabel && freqLabel) {
    lines.push(
      `${t('operations.loanDate')}: ${startLabel} · ${t('operations.frequency')}: ${freqLabel}`
    );
  } else if (startLabel) {
    lines.push(`${t('operations.loanDate')}: ${startLabel}`);
  } else if (freqLabel) {
    lines.push(`${t('operations.frequency')}: ${freqLabel}`);
  }

  const principal = snapshotNumber(
    snap,
    'principalAmount',
    'principal_amount'
  );
  const rate = snapshotNumber(snap, 'interestRate', 'interest_rate');
  const snapCur =
    snapshotStringField(snap, 'currency', 'currency') ?? currency;
  if (principal != null || rate != null) {
    const parts: string[] = [];
    if (principal != null) {
      parts.push(
        `${t('operations.amount')}: ${formatOperationCurrency(principal, snapCur)}`
      );
    }
    if (rate != null) {
      parts.push(`${t('operations.interest')}: ${rate}%`);
    }
    lines.push(parts.join(' · '));
  }

  const prevDueIso = snapshotIsoDate(
    snap,
    'previousDueDate',
    'previous_due_date'
  );
  const newDueIso = snapshotIsoDate(snap, 'newDueDate', 'new_due_date');
  if (prevDueIso != null || newDueIso != null) {
    const prevLabel = prevDueIso
      ? formatDate(prevDueIso, 'dd/MM/yyyy')
      : '—';
    const newLabel = newDueIso
      ? formatDate(newDueIso, 'dd/MM/yyyy')
      : '—';
    lines.push(
      `${t('operations.historyDueDate')}: ${prevLabel} → ${newLabel}`
    );
  } else {
    const dueIso = snapshotIsoDate(snap, 'dueDate', 'due_date');
    if (dueIso) {
      lines.push(
        `${t('operations.historyDueDate')}: ${formatDate(dueIso, 'dd/MM/yyyy')}`
      );
    }
  }

  return lines;
}

function paymentDetailLine(item: OperationHistoryEntry, t: TFunction): string | null {
  if (item.reason !== 'PAYMENT' || !item.payment) return null;
  const method = item.payment.method?.trim();
  const reference = item.payment.reference?.trim();
  const parts: string[] = [];
  if (method) {
    parts.push(`${t('operations.historyPaymentMethod')}: ${method}`);
  }
  if (reference) {
    parts.push(`${t('operations.historyPaymentReference')}: ${reference}`);
  }
  return parts.length ? parts.join(' · ') : null;
}

export default function LoanOperationHistoryScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: operation,
    refetch: refetchOperation,
    isRefetching: isRefetchingOperation,
  } = useQuery({
    queryKey: ['operations', 'loan', id],
    queryFn: () => getOperationById(id!),
    enabled: !!id,
  });

  const {
    data: historyData,
    isLoading,
    isError,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useQuery({
    queryKey: ['operations', 'loan', id, 'history', PAGE, PAGE_SIZE],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: () => getOperationHistory(id!, { page: PAGE, limit: PAGE_SIZE }),
    enabled: !!id,
  });

  const results = historyData?.results ?? [];
  const currency = operation?.currency ?? 'GBP';

  const isListRefreshing = isRefetchingOperation || isRefetchingHistory;

  const handleRefresh = useCallback(
    () => Promise.all([refetchOperation(), refetchHistory()]),
    [refetchOperation, refetchHistory]
  );

  const renderItem = useCallback(
    ({ item }: { item: OperationHistoryEntry }) => {
      const title = historyEntryTitle(item, t);
      const amount = entryDisplayAmount(item);
      const subtitle = entrySubtitle(item, currency);
      const dateIso = entryDisplayDateIso(item);
      const datePattern = entryEventDatePattern(item);
      const dateLabel =
        dateIso && !Number.isNaN(new Date(dateIso).getTime())
          ? formatDate(dateIso, datePattern)
          : '—';

      const iconName = item.reason === 'PAYMENT' ? 'receipt-2' : 'history';
      const snapshotLines = formatSnapshotDetailLines(item, t, currency);
      const paymentExtra = paymentDetailLine(item, t);

      return (
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
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
            {snapshotLines.map((line, idx) => (
              <Typography
                key={`snap-${idx}`}
                variant="caption"
                color="placeholder"
              >
                {line}
              </Typography>
            ))}
            {paymentExtra != null ? (
              <Typography
                variant="caption"
                color="placeholder"
                numberOfLines={2}
              >
                {paymentExtra}
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
            onPress={() => {
              void Promise.all([refetchOperation(), refetchHistory()]);
            }}
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
            refreshing={isListRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
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
