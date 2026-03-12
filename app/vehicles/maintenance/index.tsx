import { useMemo } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
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
} from '@/lib/services/vehicleHistoryService';

const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  OIL_CHANGE: 'Troca de oleo',
  TIRE_PRESSURE: 'Calibragem de pneu',
  FILTER_CHANGE: 'Troca de filtros',
  BATTERY_CHECK: 'Verificacao de bateria',
  OTHER: 'Outro',
};

function toDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function VehicleMaintenanceIndexScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['vehicle-maintenance', vehicleId],
    queryFn: () => getVehicleMaintenances(vehicleId!),
    enabled: !!vehicleId,
  });

  const alerts = useMemo(() => (data ?? []).slice(0, 4), [data]);
  const historyCount = data?.length ?? 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <BackButton />
      </View>

      <Typography variant="h3Bold" style={styles.title}>
        {t('operations.maintenance')}
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
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={() => {
            if (!isRefetching) refetch();
          }}
        >
          <View style={styles.section}>
            <Typography variant="h6Medium" color="text">
              {t('operations.maintenanceAlerts')}
            </Typography>

            {alerts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Typography variant="body2" color="placeholder">
                  {t('operations.noMaintenanceRecords')}
                </Typography>
              </View>
            ) : (
              alerts.map((alert) => (
                <View
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.alertHeader}>
                    <View style={[styles.tag, { backgroundColor: colors.tertiary }]}>
                      <Typography variant="body2Medium" color="tertiaryForeground">
                        {MAINTENANCE_TYPE_LABELS[alert.type]}
                      </Typography>
                    </View>
                    <Typography variant="h4" color="placeholder">
                      ...
                    </Typography>
                  </View>

                  <Typography variant="body1" color="placeholder">
                    {toDate(alert.maintenanceDate, 'pt-BR')}
                  </Typography>

                  <Button
                    variant="secondary"
                    size="full"
                    onPress={() => {
                      // Placeholder-only behavior for now.
                    }}
                    style={styles.alertAction}
                  >
                    {t('operations.markAsDone')}
                  </Button>

                  <Button
                    variant="secondary"
                    size="full"
                    onPress={() => {
                      // Placeholder-only behavior for now.
                    }}
                    style={[styles.alertAction, { backgroundColor: colors.muted }]}
                  >
                    {t('operations.remindLater')}
                  </Button>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Typography variant="h6Medium" color="text">
              {t('operations.maintenanceOptions')}
            </Typography>

            <View style={styles.optionsRow}>
              <Pressable
                style={[styles.optionCard, { backgroundColor: colors.muted }]}
                onPress={() => {
                  if (!vehicleId) return;
                  router.push(`/vehicles/maintenance/history?vehicleId=${vehicleId}` as any);
                }}
              >
                <View style={styles.optionTop}>
                  <Icon name="history" size={24} color="primaryForeground" />
                  <Typography variant="body1" color="placeholder">
                    {historyCount}
                  </Typography>
                </View>
                <Typography variant="body1Medium" color="primaryForeground">
                  {t('operations.maintenanceHistory')}
                </Typography>
              </Pressable>

              <Pressable
                style={[styles.optionCard, { backgroundColor: colors.muted }]}
                onPress={() => {
                  // Placeholder-only behavior for now.
                }}
              >
                <View style={styles.optionTop}>
                  <Icon name="warning" size={24} color="primaryForeground" />
                  <Typography variant="body1" color="placeholder">
                    7
                  </Typography>
                </View>
                <Typography variant="body1Medium" color="primaryForeground">
                  {t('operations.configureAlerts')}
                </Typography>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="full"
          onPress={() => {
            if (!vehicleId) return;
            router.push(`/vehicles/maintenance/new?vehicleId=${vehicleId}` as any);
          }}
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
  title: {
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  alertCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alertAction: {
    minHeight: 44,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 118,
    justifyContent: 'space-between',
  },
  optionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});
