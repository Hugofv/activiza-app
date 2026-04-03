import React, { useMemo } from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getLoanStatusPresentation } from '@/lib/operations/loanStatusPresentation';
import type { FrequencyType, Operation } from '@/lib/services/operationService';
import { getReliabilityScore } from '@/lib/utils/clientReliability';

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const FREQUENCY_KEY: Record<FrequencyType, string> = {
  WEEKLY: 'operations.weeklyContract',
  BIWEEKLY: 'operations.biweeklyContract',
  MONTHLY: 'operations.monthlyContract',
};

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
    () => getLoanStatusPresentation(operation, t),
    [operation, t]
  );

  const reliability = useMemo(
    () => getReliabilityScore(operation.client),
    [operation.client]
  );

  const totalWithInterest = operation.principalAmount * (1 + operation.interestRate / 100);

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
                  accessibilityLabel={t('clients.listChipReliabilityA11y', {
                    value: reliability,
                  })}
                >
                  {reliability}
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
            {formatCurrency(operation.principalAmount, operation.currency)}
          </Typography>
          <Typography
            variant="caption"
            color="placeholder"
            style={{ textAlign: 'right' }}
          >
            +{operation.interestRate}%
          </Typography>
        </View>
      </View>

      {/* Bottom row: status badge | total with interest */}
      <View style={styles.bottomRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Typography
            variant="body2SemiBold"
            style={{ color: badge.fg }}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
