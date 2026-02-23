import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VehicleCard } from '@/components/operations/VehicleCard';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type Vehicle,
  type VehicleStatus,
  deleteVehicles,
  getVehicles,
} from '@/lib/services/vehicleService';

type FilterValue = 'all' | 'AVAILABLE' | 'RENTED';

export default function VehicleListScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
    { value: 'all', label: t('operations.filterAll') },
    { value: 'AVAILABLE', label: t('operations.filterAvailable') },
    { value: 'RENTED', label: t('operations.filterRented') },
  ];

  const statusFilter: VehicleStatus | undefined =
    selectedFilter === 'all' ? undefined : selectedFilter;

  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['vehicles', statusFilter],
    queryFn: () => getVehicles({ status: statusFilter }),
    enabled: true,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => deleteVehicles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setSelectedIds(new Set());
      setIsEditing(false);
    },
  });

  const vehicles = vehiclesData?.results ?? [];
  const count = vehiclesData?.count ?? 0;
  console.log('vehicles', vehicles);

  const toggleEditMode = () => {
    if (isEditing) {
      setSelectedIds(new Set());
    }
    setIsEditing(!isEditing);
  };

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleVehiclePress = useCallback(
    (vehicle: Vehicle) => {
      if (isEditing) {
        toggleSelection(vehicle.id);
      } else {
        router.push(`/vehicles/${vehicle.id}` as any);
      }
    },
    [isEditing, toggleSelection]
  );

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      t('common.confirmDelete'),
      t('operations.deleteVehiclesConfirm', { count: selectedIds.size }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteMutation.mutate(Array.from(selectedIds)),
        },
      ]
    );
  };

  const handleAddVehicle = () => {
    router.push('/vehicles/new' as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {isEditing ? (
            <Pressable
              onPress={toggleEditMode}
              hitSlop={12}
            >
              <Typography
                variant="body1SemiBold"
                color="primaryForeground"
              >
                OK
              </Typography>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={styles.backButton}
            >
              <Icon
                name="chevron-back"
                size={24}
                color="primaryForeground"
              />
            </Pressable>
          )}

          <View style={{ flex: 1 }} />

          <View style={styles.headerActions}>
            {!isEditing && (
              <>
                <Pressable
                  onPress={toggleEditMode}
                  hitSlop={8}
                >
                  <Typography
                    variant="body2SemiBold"
                    color="primaryForeground"
                    style={styles.editLabel}
                  >
                    {t('operations.edit')}
                  </Typography>
                </Pressable>
                <Pressable
                  onPress={handleAddVehicle}
                  hitSlop={8}
                >
                  <Icon
                    name="plus"
                    size={24}
                    color="primaryForeground"
                  />
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Title + count */}
        <View style={styles.titleRow}>
          <Typography variant="h3">
            {t('operations.vehicles')}
          </Typography>
          {!isLoading && (
            <Typography
              variant="h3"
              color="placeholder"
              style={{ marginLeft: 8 }}
            >
              {count}
            </Typography>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = selectedFilter === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[
                  styles.filterChip,
                  {
                    borderColor: isActive ? colors.primaryForeground : colors.border,
                    backgroundColor: isActive ? colors.muted : 'transparent',
                  },
                ]}
                onPress={() => setSelectedFilter(opt.value)}
              >
                <Typography
                  variant="body2Medium"
                  style={{
                    color: isActive ? colors.primaryForeground : colors.icon,
                  }}
                >
                  {opt.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.centeredContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : error ? (
          <View style={styles.centeredContainer}>
            <Typography
              variant="body1"
              color="icon"
            >
              {t('operations.vehicleLoadError')}
            </Typography>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.centeredContainer}>
            <Typography
              variant="body1"
              color="icon"
            >
              {t('operations.noVehicles')}
            </Typography>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <VehicleCard
                vehicle={item}
                onPress={handleVehiclePress}
                selectable={isEditing}
                selected={selectedIds.has(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refetch}
            refreshing={isRefetching}
          />
        )}

        {/* Bottom action */}
        <View style={styles.bottomButton}>
          {isEditing && selectedIds.size > 0 ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.muted }]}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Icon
                name="trash"
                size={20}
                color="primaryForeground"
              />
              <Typography
                variant="body1SemiBold"
                color="primaryForeground"
                style={{ marginLeft: 8 }}
              >
                {t('operations.deleteItems', { count: selectedIds.size })}
              </Typography>
            </Pressable>
          ) : !isEditing ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleAddVehicle}
            >
              <Typography
                variant="body1SemiBold"
                color="primaryForeground"
              >
                {t('operations.newRental')}
              </Typography>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  editLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  actionButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
