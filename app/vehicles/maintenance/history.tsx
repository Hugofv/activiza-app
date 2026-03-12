import { useMemo } from 'react';

import {
  ActivityIndicator,
  FlatList,
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
  type MaintenanceType,
  getVehicleMaintenances,
  groupHistoryByMonth,
} from '@/lib/services/vehicleHistoryService';

const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  OIL_CHANGE: 'Troca de oleo',
  TIRE_PRESSURE: 'Calibragem de pneu',
  FILTER_CHANGE: 'Troca de filtros',
  BATTERY_CHECK: 'Verificacao de bateria',
  OTHER: 'Outro',
};

function toCurrency(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function toDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function VehicleMaintenanceHistoryScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['vehicle-maintenance', vehicleId],
    queryFn: () => getVehicleMaintenances(vehicleId!),
    enabled: !!vehicleId,
  });

  const groups = useMemo(
    () => groupHistoryByMonth(data ?? [], 'maintenanceDate', i18n.language),
    [data, i18n.language]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <BackButton />
        <Button
          variant="secondary"
          size="sm"
          disabled
        >
          <View style={styles.filterButton}>
            <Typography variant="body2Medium" color="primaryForeground">
              {t('operations.filterAll')}
            </Typography>
            <Icon name="chevron-down" size={16} color="primaryForeground" />
          </View>
        </Button>
      </View>

      <Typography variant="h3Bold" style={styles.title}>
        {t('operations.maintenanceHistory')}
      </Typography>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Typography variant="body2" color="placeholder">
            {t('operations.vehicleLoadError')}
          </Typography>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.centered}>
          <Typography variant="body2" color="placeholder">
            {t('operations.noMaintenanceRecords')}
          </Typography>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.key}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <View style={[styles.groupTitle, { backgroundColor: colors.muted }]}>
                <Typography variant="caption" color="placeholder">
                  {capitalize(group.monthLabel)}
                </Typography>
              </View>

              {group.records.map((record) => (
                <View
                  key={record.id}
                  style={[styles.row, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.rowTop}>
                    <View style={[styles.tag, { backgroundColor: colors.tertiary }]}>
                      <Typography variant="body2Medium" color="tertiaryForeground">
                        {MAINTENANCE_TYPE_LABELS[record.type]}
                      </Typography>
                    </View>
                    <Icon name="chevron-right" size={16} color="icon" />
                  </View>
                  <View style={styles.rowBottom}>
                    <Typography variant="body1SemiBold" color="text">
                      {toCurrency(record.amount, record.currency, i18n.language)}
                    </Typography>
                    <Typography variant="body2" color="placeholder">
                      {toDate(record.maintenanceDate, i18n.language)}
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="full"
          onPress={() =>
            router.push(`/vehicles/maintenance/new?vehicleId=${vehicleId}` as any)
          }
        >
          {t('operations.register')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    marginBottom: 14,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 120,
    gap: 12,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    borderRadius: 2,
    paddingVertical: 4,
    alignItems: 'center',
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});
