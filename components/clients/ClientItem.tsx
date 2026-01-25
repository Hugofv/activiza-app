import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Client } from '@/lib/services/clientService';

export interface ClientItemProps {
  client: Client;
  onPress?: (client: Client) => void;
}

/**
 * Client list item component
 */
export const ClientItem: React.FC<ClientItemProps> = ({
  client,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    onPress?.(client);
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '0';
    const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'BRL' ? 'R$' : '';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.icon }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
          <Icon name="user" size={24} color={colors.icon} />
        </View>

        {/* Client Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Typography variant="body1" style={[styles.name, { color: colors.text }]}>
              {client.name}
            </Typography>
            {client.rating !== undefined && (
              <View style={styles.rating}>
                <Icon name="star" size={16} color={colors.icon} />
                <Typography variant="caption" style={[styles.ratingText, { color: colors.icon }]}>
                  {client.rating}
                </Typography>
              </View>
            )}
          </View>

          {/* Indicators */}
          <View style={styles.indicators}>
            {client.pendingOperations !== undefined && client.pendingOperations > 0 && (
              <View style={[styles.indicator, styles.pendingIndicator, { backgroundColor: '#fef3c7' }]}>
                <Icon name="calendar" size={14} color="#d97706" />
                <Typography variant="caption" style={[styles.indicatorText, { color: '#d97706' }]}>
                  {client.pendingOperations}
                </Typography>
              </View>
            )}

            {client.completedOperations !== undefined && client.completedOperations > 0 && (
              <View style={[styles.indicator, styles.completedIndicator, { backgroundColor: '#d1fae5' }]}>
                <Icon name="check" size={14} color="#059669" />
                <Typography variant="caption" style={[styles.indicatorText, { color: '#059669' }]}>
                  {client.completedOperations}
                </Typography>
              </View>
            )}

            {client.totalAmount !== undefined && client.totalAmount > 0 && (
              <View style={[styles.indicator, styles.amountIndicator, { backgroundColor: colors.muted }]}>
                <Icon name="users" size={14} color={colors.icon} />
                <Typography variant="caption" style={[styles.indicatorText, { color: colors.text }]}>
                  {formatCurrency(client.totalAmount, client.currency || 'GBP')}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <Icon name="chevron-right" size={20} color={colors.icon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingIndicator: {},
  completedIndicator: {},
  amountIndicator: {},
  indicatorText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
