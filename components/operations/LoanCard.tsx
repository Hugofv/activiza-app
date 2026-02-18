import React, { useMemo } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type {
  FrequencyType,
  Operation,
  OperationStatus,
} from '@/lib/services/operationService';
import { formatDate } from '@/lib/utils/dateFormat';

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const FREQUENCY_KEY: Record<FrequencyType, string> = {
  WEEKLY: 'operations.weeklyContract',
  BIWEEKLY: 'operations.biweeklyContract',
  MONTHLY: 'operations.monthlyContract',
};

function getStatusBadge(
  status: OperationStatus,
  dueDate: string,
  colors: { success: string; successForeground: string },
  t: (key: string) => string
): { label: string; bg: string; fg: string; icon: string } {
  if (status === 'COMPLETED') {
    return {
      label: t('operations.closed'),
      bg: colors.success,
      fg: colors.successForeground,
      icon: 'checkmark',
    };
  }

  const now = new Date();
  const due = new Date(dueDate);
  const isOverdue = due < now;

  if (status === 'OVERDUE' || isOverdue) {
    return {
      label: formatDate(dueDate, 'dd/MM/yyyy'),
      bg: '#FEE2E2',
      fg: '#991B1B',
      icon: 'calendar-dots',
    };
  }

  return {
    label: formatDate(dueDate, 'dd/MM/yyyy'),
    bg: '#DCFCE7',
    fg: '#166534',
    icon: 'calendar-dots',
  };
}

function formatCurrency(value: number, currency: string): string {
  const symbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '£';
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted}${symbol}`;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

interface LoanCardProps {
  operation: Operation;
  onPress?: (operation: Operation) => void;
}

export function LoanCard({ operation, onPress }: LoanCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const frequencyLabel = t(
    FREQUENCY_KEY[operation.frequency] ?? 'operations.monthlyContract'
  );

  const badge = useMemo(
    () => getStatusBadge(operation.status, operation.dueDate, colors, t),
    [operation.status, operation.dueDate, colors, t]
  );

  const totalWithInterest = operation.amount * (1 + operation.interest / 100);

  const clientName = operation.client?.name ?? `Client #${operation.clientId}`;

  return (
    <Pressable
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() => onPress?.(operation)}
    >
      {/* Top row: avatar + name + star | amount + interest */}
      <View style={styles.topRow}>
        <View style={styles.clientInfo}>
          <Avatar
            image={operation.client?.profilePictureUrl}
            icon="user"
            size={36}
          />
          <View style={styles.clientText}>
            <View style={styles.nameRow}>
              <Typography
                variant="body2SemiBold"
                numberOfLines={1}
                style={{ flexShrink: 1 }}
              >
                {clientName}
              </Typography>
              <View style={styles.starBadge}>
                <Icon
                  name="star-filled"
                  size={12}
                  color="starFilled"
                />
                <Typography
                  variant="caption"
                  color="icon"
                  style={{ marginLeft: 2 }}
                >
                  {0}
                </Typography>
              </View>
            </View>
            <Typography
              variant="caption"
              color="placeholder"
            >
              {frequencyLabel}
            </Typography>
          </View>
        </View>

        <View style={styles.amountInfo}>
          <Typography
            variant="h5"
            style={{ textAlign: 'right' }}
          >
            {formatCurrency(operation.amount, operation.currency)}
          </Typography>
          <Typography
            variant="caption"
            color="placeholder"
            style={{ textAlign: 'right' }}
          >
            +{operation.interest}%
          </Typography>
        </View>
      </View>

      {/* Bottom row: status badge | total with interest */}
      <View style={styles.bottomRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Icon
            name={badge.icon as any}
            size={14}
            color={badge.fg}
          />
          <Typography
            variant="caption"
            style={{ color: badge.fg, marginLeft: 4 }}
          >
            {badge.label}
          </Typography>
        </View>

        <View style={styles.totalRow}>
          <Icon
            name="user-dollar"
            size={16}
            color="placeholder"
          />
          <Typography
            variant="body2SemiBold"
            color="placeholder"
            style={{ marginLeft: 4 }}
          >
            {formatCurrency(totalWithInterest, operation.currency)}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  clientText: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
