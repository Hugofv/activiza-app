import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Client } from '@/lib/services/clientService';

import { Badge } from '../ui/Badge';

export interface ClientItemProps {
  client: Client;
  onPress?: (client: Client) => void;
}

/**
 * Client list item component
 */
export const ClientItem: React.FC<ClientItemProps> = ({ client, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    onPress?.(client);
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '0';
    const currencySymbol =
      currency === 'GBP'
        ? '£'
        : currency === 'USD'
          ? '$'
          : currency === 'BRL'
            ? 'R$'
            : '';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <Avatar
          image={client.profilePictureUrl}
          icon="user-filled"
          size={48}
          backgroundColor="muted"
          iconColor="icon"
        />

        {/* Client Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Typography
              variant="body1Medium"
              style={styles.name}
            >
              {client.name}
            </Typography>
            <View style={styles.rating}>
              <Badge
                icon="star-filled"
                value={client.rating || 4}
                backgroundColor="muted"
                foregroundColor="icon"
                size="sm"
              />
              <Badge
                icon="calendar-dots"
                value={client.rating || 3}
                backgroundColor="tertiary"
                foregroundColor="tertiaryForeground"
                size="sm"
              />
              <Badge
                icon="check"
                value={client.rating || 2}
                backgroundColor="success"
                foregroundColor="successForeground"
                size="sm"
              />
              <Badge
                icon="user-dollar"
                value="600£"
                backgroundColor="muted"
                foregroundColor="primaryForeground"
                size="sm"
              />
            </View>
          </View>

          {/* Indicators */}
          <View style={styles.indicators}>
            {client.pendingOperations !== undefined &&
              client.pendingOperations > 0 && (
                <View
                  style={[
                    styles.indicator,
                    styles.pendingIndicator,
                    { backgroundColor: '#fef3c7' },
                  ]}
                >
                  <Icon
                    name="calendar"
                    size={14}
                    color="warning"
                  />
                  <Typography
                    variant="caption"
                    style={[styles.indicatorText, { color: 'warning' }]}
                  >
                    {client.pendingOperations}
                  </Typography>
                </View>
              )}

            {client.completedOperations !== undefined &&
              client.completedOperations > 0 && (
                <View
                  style={[
                    styles.indicator,
                    styles.completedIndicator,
                    { backgroundColor: '#d1fae5' },
                  ]}
                >
                  <Icon
                    name="check"
                    size={14}
                    color="successForeground"
                  />
                  <Typography
                    variant="caption"
                    color="successForeground"
                    style={[styles.indicatorText]}
                  >
                    {client.completedOperations}
                  </Typography>
                </View>
              )}

            {client.totalAmount !== undefined && client.totalAmount > 0 && (
              <View
                style={[
                  styles.indicator,
                  styles.amountIndicator,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Icon
                  name="users"
                  size={14}
                  color="icon"
                />
                <Typography
                  variant="caption"
                  style={[styles.indicatorText, { color: colors.text }]}
                >
                  {formatCurrency(client.totalAmount, client.currency || 'GBP')}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {fontSize: 12,},
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
