import React from 'react';

import { Pressable, StyleSheet, View } from 'react-native';

import { Image as ExpoImage } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type Vehicle,
  getVehicleDisplayName,
  getVehicleImageUrl,
  getVehicleSubtype,
} from '@/lib/services/vehicleService';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: (vehicle: Vehicle) => void;
  selected?: boolean;
  selectable?: boolean;
}

function formatCurrency(value: number, currency = 'GBP'): string {
  const symbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '£';
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `${symbol} ${formatted}`;
}

function formatMileage(km: string | number): string {
  const num = typeof km === 'string' ? parseInt(km, 10) : km;
  if (isNaN(num)) return '';
  return `${new Intl.NumberFormat('pt-BR').format(num)} km`;
}

export function VehicleCard({
  vehicle,
  onPress,
  selected,
  selectable,
}: VehicleCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isRented = vehicle.status === 'RENTED';
  const statusLabel = isRented
    ? t('operations.rented')
    : t('operations.available');
  const statusBg = isRented ? '#FEF3C7' : '#DCFCE7';
  const statusFg = isRented ? '#92400E' : '#166534';

  const displayName = getVehicleDisplayName(vehicle);

  return (
    <Pressable
      style={[styles.card, { borderColor: colors.border }]}
      onPress={() => onPress?.(vehicle)}
    >
      {/* Top row: selection circle / image + info | amount + interest */}
      <View style={styles.topRow}>
        {selectable && (
          <View
            style={[
              styles.selectionCircle,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : 'transparent',
              },
            ]}
          >
            {selected && (
              <Icon
                name="check"
                size={14}
                color="primaryForeground"
              />
            )}
          </View>
        )}

        <View style={styles.vehicleInfo}>
          {getVehicleImageUrl(vehicle) ? (
            <ExpoImage
              source={{ uri: getVehicleImageUrl(vehicle) }}
              style={styles.vehicleImage}
              contentFit="cover"
            />
          ) : (
            <View
              style={[styles.vehicleImagePlaceholder, { backgroundColor: colors.muted }]}
            >
              <Icon
                name={getVehicleSubtype(vehicle) === 'MOTORCYCLE' ? 'motorbike' : 'car'}
                size={24}
                color="icon"
              />
            </View>
          )}
          <View style={styles.vehicleText}>
            <Typography
              variant="body2SemiBold"
              numberOfLines={1}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              color="placeholder"
            >
              {vehicle.plate}
            </Typography>
          </View>
        </View>

        <View style={styles.amountInfo}>
          <Typography
            variant="h5"
            color="primaryForeground"
            style={{ textAlign: 'right' }}
          >
            {vehicle.value ? formatCurrency(vehicle.value, vehicle.currency) : '—'}
          </Typography>
          {vehicle.interestRate != null && vehicle.interestRate > 0 && (
            <Typography
              variant="caption"
              color="placeholder"
              style={{ textAlign: 'right' }}
            >
              +{vehicle.interestRate}%
            </Typography>
          )}
        </View>
      </View>

      {/* Bottom row: details | status badge */}
      <View style={styles.bottomRow}>
        <View style={styles.detailsRow}>
          {vehicle.value != null && (
            <View style={styles.detailItem}>
              <Icon
                name="cash-outline"
                size={14}
                color="placeholder"
              />
              <Typography
                variant="caption"
                color="placeholder"
                style={{ marginLeft: 3 }}
              >
                {formatCurrency(vehicle.value, vehicle.currency)}
              </Typography>
            </View>
          )}
          {vehicle.mileage != null && (
            <View style={styles.detailItem}>
              <Icon
                name="history"
                size={14}
                color="placeholder"
              />
              <Typography
                variant="caption"
                color="placeholder"
                style={{ marginLeft: 3 }}
              >
                {formatMileage(vehicle.mileage)}
              </Typography>
            </View>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Typography
            variant="caption"
            style={{ color: statusFg, fontWeight: '600' }}
          >
            {statusLabel}
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
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 14,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  vehicleImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  vehicleImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleText: {
    marginLeft: 10,
    flex: 1,
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
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
