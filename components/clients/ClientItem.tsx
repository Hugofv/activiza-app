import React, { useMemo } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Client } from '@/lib/services/clientService';
import { getReliabilityScore } from '@/lib/utils/clientReliability';

import { Badge } from '../ui/Badge';

export interface ClientItemProps {
  client: Client;
  onPress?: (client: Client) => void;
}

function formatDebtAmount(amount: number | undefined, currency?: string): string {
  const code = currency || 'GBP';
  const currencySymbol =
    code === 'GBP'
      ? '£'
      : code === 'USD'
        ? '$'
        : code === 'BRL'
          ? 'R$'
          : '';
  const n = amount ?? 0;
  return `${currencySymbol}${n.toLocaleString()}`;
}

/**
 * Client list item component
 */
export const ClientItem: React.FC<ClientItemProps> = ({ client, onPress }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    onPress?.(client);
  };

  const reliability = useMemo(() => getReliabilityScore(client), [client]);
  const pendingNearDue = client.pendingOperations ?? 0;
  const paidContracts = client.completedOperations ?? 0;
  const debtLabel = formatDebtAmount(
    client.totalAmount,
    client.currency || 'GBP'
  );

  const a11yReliability = t('clients.listChipReliabilityA11y', {
    value: reliability,
  });
  const a11yLoansDue = t('clients.listChipLoansDueA11y', {
    value: pendingNearDue,
  });
  const a11yPaid = t('clients.listChipPaidContractsA11y', {
    value: paidContracts,
  });
  const a11yDebt = t('clients.listChipDebtA11y', { value: debtLabel });

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Avatar
          image={client.profilePictureUrl}
          icon="user-filled"
          size={48}
          backgroundColor="muted"
          iconColor="icon"
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Typography
              variant="body1Medium"
              style={styles.name}
            >
              {client.name}
            </Typography>
            <View style={styles.metricsRow}>
              <Badge
                icon="star-filled"
                value={reliability}
                backgroundColor="muted"
                foregroundColor="icon"
                size="sm"
                accessibilityLabel={a11yReliability}
                accessible
              />
              <Badge
                icon="calendar-dots"
                value={pendingNearDue}
                backgroundColor="tertiary"
                foregroundColor="tertiaryForeground"
                size="sm"
                accessibilityLabel={a11yLoansDue}
                accessible
              />
              <Badge
                icon="check"
                value={paidContracts}
                backgroundColor="success"
                foregroundColor="successForeground"
                size="sm"
                accessibilityLabel={a11yPaid}
                accessible
              />
              <Badge
                icon="user-dollar"
                value={debtLabel}
                backgroundColor="muted"
                foregroundColor="primaryForeground"
                size="sm"
                accessibilityLabel={a11yDebt}
                accessible
              />
            </View>
          </View>
        </View>

        <Icon
          name="chevron-right"
          size={20}
          color="icon"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'column',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
});
