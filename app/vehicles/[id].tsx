import { useCallback, useState } from 'react';

import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import SummaryItem from '@/app/clients/new/components/SummaryItem';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Skeleton } from '@/components/ui/Skeleton';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type Vehicle,
  buildVehicleTitle,
  getVehicleById,
  getVehicleDisplayName,
  getVehiclePhotoUrls,
  getVehicleSubtype,
  updateVehicle,
} from '@/lib/services/vehicleService';
import { useEditVehicleStore } from '@/lib/stores/editVehicleStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 300;

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
  return `${new Intl.NumberFormat('pt-BR').format(num)}km`;
}

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    initFromVehicle,
    clear: clearEditStore,
    draft,
    vehicleId: editVehicleId,
  } = useEditVehicleStore();

  const isThisVehicleEdit = editVehicleId === id;
  const displayDraft = isEditing && isThisVehicleEdit ? draft : null;

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });

  const onScrollImage = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveImageIndex(idx);
    },
    []
  );

  const handleEdit = () => {
    if (vehicle) {
      initFromVehicle(vehicle);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    clearEditStore();
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!id || !isThisVehicleEdit) return;
    setIsSaving(true);
    try {
      const {
        _displayPhotos,
        _newPhotoUris,
        subtype,
        ...fields
      } = draft;

      await updateVehicle(id, {
        ...fields,
        title: buildVehicleTitle(
          fields.brand ?? vehicle?.brand ?? '',
          fields.model ?? vehicle?.model ?? '',
          fields.year ?? vehicle?.year
        ),
        meta: { subtype: subtype ?? 'CAR' },
        photos: _newPhotoUris?.length ? _newPhotoUris : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      clearEditStore();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const goToEditScreen = (path: string) => {
    if (id) router.push(`${path}?vehicleId=${id}&edit=1` as any);
  };

  // Resolve displayed values (draft overrides vehicle)
  const displayBrand = displayDraft?.brand ?? vehicle?.brand ?? '';
  const displayModel = displayDraft?.model ?? vehicle?.model ?? '';
  const displayYear = displayDraft?.year ?? vehicle?.year;
  const displayPlate = displayDraft?.plate ?? vehicle?.plate ?? '';
  const displayValue = displayDraft?.value ?? vehicle?.value;
  const displayCurrency = displayDraft?.currency ?? vehicle?.currency;
  const displayMileage = displayDraft?.mileage ?? vehicle?.mileage;
  const displayObservation = displayDraft?.observation ?? vehicle?.observation;
  const displaySubtype = displayDraft?.subtype ?? (vehicle ? getVehicleSubtype(vehicle) : 'CAR');

  const displayName = displayDraft
    ? buildVehicleTitle(displayBrand, displayModel, displayYear)
    : vehicle
      ? getVehicleDisplayName(vehicle)
      : '';

  // Photos: in edit mode use store display photos, otherwise vehicle images
  const displayPhotos = displayDraft?._displayPhotos
    ? displayDraft._displayPhotos.map((p) => p.uri)
    : vehicle
      ? getVehiclePhotoUrls(vehicle)
      : [];

  const isRented = (displayDraft?.status ?? vehicle?.status) === 'RENTED';
  const photoCardSize = screenWidth * 0.25;

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <BackButton />
        </View>
        <Skeleton style={{ width: '100%', height: HERO_HEIGHT, borderRadius: 20 }} />
        <View style={{ padding: 24, gap: 16 }}>
          <Skeleton style={{ width: '60%', height: 20, borderRadius: 8 }} />
          <Skeleton style={{ width: '100%', height: 52, borderRadius: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton style={{ flex: 1, height: 90, borderRadius: 12 }} />
            <Skeleton style={{ flex: 1, height: 90, borderRadius: 12 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <BackButton />
        </View>
        <View style={styles.emptyState}>
          <Typography variant="body1" color="icon">
            Vehicle not found
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        {isEditing ? <View style={{ width: 80 }} /> : <BackButton />}

        {isEditing ? (
          <View style={styles.editButtonsRow}>
            <Button
              variant="outline"
              size="sm"
              onPress={handleCancelEdit}
              style={styles.headerBtn}
            >
              <Typography variant="body2Medium" color="primaryForeground">
                {t('common.cancel')}
              </Typography>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={handleSaveEdit}
              loading={isSaving}
              style={styles.headerBtn}
            >
              {t('common.save')}
            </Button>
          </View>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onPress={handleEdit}
            style={styles.headerBtn}
          >
            <Typography variant="body2Medium" color="primaryForeground">
              {t('common.edit')}
            </Typography>
          </Button>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero image carousel */}
        {!isEditing && (
          <View style={styles.heroContainer}>
            {displayPhotos.length > 0 ? (
              <>
                <FlatList
                  data={displayPhotos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onScrollImage}
                  keyExtractor={(_, i) => String(i)}
                  renderItem={({ item }) => (
                    <ExpoImage
                      source={{ uri: item }}
                      style={styles.heroImage}
                      contentFit="cover"
                    />
                  )}
                />
                <View style={styles.heroOverlay}>
                  <Typography variant="h4" style={{ color: '#fff' }}>
                    {displayName}
                  </Typography>
                  <View style={styles.heroBadges}>
                    {displayPlate && (
                      <View style={styles.heroBadge}>
                        <Typography variant="caption" style={styles.heroBadgeText}>
                          {displayPlate}
                        </Typography>
                      </View>
                    )}
                    {displayMileage != null && (
                      <View style={styles.heroBadge}>
                        <Typography variant="caption" style={styles.heroBadgeText}>
                          {formatMileage(displayMileage)}
                        </Typography>
                      </View>
                    )}
                    {displayValue != null && (
                      <View style={styles.heroBadge}>
                        <Typography variant="caption" style={styles.heroBadgeText}>
                          {formatCurrency(displayValue, displayCurrency)}
                        </Typography>
                      </View>
                    )}
                  </View>
                </View>
                {displayPhotos.length > 1 && (
                  <View style={styles.paginationDots}>
                    {displayPhotos.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          { backgroundColor: i === activeImageIndex ? '#fff' : 'rgba(255,255,255,0.5)' },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.heroPlaceholder, { backgroundColor: colors.muted }]}>
                <Icon
                  name={displaySubtype === 'MOTORCYCLE' ? 'motorbike' : 'car'}
                  size={64}
                  color="icon"
                />
                <View style={[styles.heroOverlay, { backgroundColor: 'transparent' }]}>
                  <Typography variant="h4" style={{ color: colors.text }}>
                    {displayName}
                  </Typography>
                  <View style={styles.heroBadges}>
                    {displayPlate && (
                      <View style={[styles.heroBadge, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                        <Typography variant="caption" style={{ color: colors.text, fontWeight: '600' }}>
                          {displayPlate}
                        </Typography>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {isRented && vehicle.currentClient && (
              <Pressable
                style={[styles.rentedBar, { backgroundColor: colors.primary }]}
                onPress={() => {
                  // TODO: navigate to client detail
                }}
              >
                <View style={styles.rentedBarLeft}>
                  <Typography variant="body2SemiBold" style={{ color: colors.primaryForeground }}>
                    {t('operations.rented')}
                  </Typography>
                </View>
                <View style={styles.rentedBarRight}>
                  {vehicle.currentClient.profilePictureUrl ? (
                    <ExpoImage
                      source={{ uri: vehicle.currentClient.profilePictureUrl }}
                      style={styles.clientAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.clientAvatarPlaceholder, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                      <Icon name="user" size={14} color="primaryForeground" />
                    </View>
                  )}
                  <Typography variant="body2SemiBold" style={{ color: colors.primaryForeground, marginLeft: 6 }}>
                    {vehicle.currentClient.name}
                  </Typography>
                  <Icon name="chevron-right" size={18} color="primaryForeground" />
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* Details section */}
        <View style={styles.detailsSection}>
          {/* Vehicle info (type + brand + model + year + plate) */}
          <SummaryItem
            icon="car"
            isEditing={isEditing}
            label={t('operations.vehicles')}
            value={
              <View style={{ gap: 2 }}>
                <Typography variant="h6Medium" color="text">
                  {displayName}
                </Typography>
                <Typography variant="body2" color="placeholder">
                  {displayPlate} · {displaySubtype === 'MOTORCYCLE' ? t('operations.motorcycle') : t('operations.car')}
                </Typography>
              </View>
            }
            onPress={isEditing ? () => goToEditScreen('/vehicles/new') : undefined}
          />

          {/* Value */}
          {(displayValue != null || isEditing) && (
            <SummaryItem
              icon="cash-outline"
              isEditing={isEditing}
              label={t('operations.value')}
              value={displayValue != null ? formatCurrency(displayValue, displayCurrency) : '—'}
              onPress={isEditing ? () => goToEditScreen('/vehicles/new') : undefined}
            />
          )}

          {/* Mileage */}
          {(displayMileage != null || isEditing) && (
            <SummaryItem
              icon="history"
              isEditing={isEditing}
              label={t('operations.mileageHistory')}
              value={displayMileage != null ? formatMileage(displayMileage) : '—'}
              onPress={isEditing ? () => goToEditScreen('/vehicles/new') : undefined}
            />
          )}

          {/* Observation */}
          {(displayObservation || isEditing) && (
            <SummaryItem
              icon="note"
              isEditing={isEditing}
              label={t('operations.anyObservation')}
              value={displayObservation ?? '—'}
              onPress={isEditing ? () => goToEditScreen('/vehicles/new/observation') : undefined}
            />
          )}

          {/* Photos */}
          <SummaryItem
            icon="photo"
            isEditing={isEditing}
            label={t('operations.photos')}
            onPress={isEditing ? () => goToEditScreen('/vehicles/new/photos') : undefined}
            value={
              displayPhotos.length > 0 ? (
                <FlatList
                  data={displayPhotos}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => `photo-${i}`}
                  contentContainerStyle={{ gap: 8, marginTop: 4 }}
                  scrollEnabled={!isEditing}
                  renderItem={({ item }) => (
                    <ImageCardView
                      uri={item}
                      style={{ width: photoCardSize, height: photoCardSize }}
                    />
                  )}
                />
              ) : (
                <Typography variant="body2" color="placeholder">
                  {t('operations.noPhotos')}
                </Typography>
              )
            }
          />
        </View>

        {/* Non-edit mode action rows */}
        {!isEditing && (
          <>
            <View style={styles.cardRow}>
              <Pressable
                style={[styles.infoCard, { borderColor: colors.border }]}
                onPress={() => {
                  // TODO: navigate to maintenance list
                }}
              >
                <View style={styles.infoCardHeader}>
                  <Icon name="settings" size={24} color="primaryForeground" />
                  {(vehicle.maintenanceCount ?? 0) > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: colors.error }]}>
                      <Typography variant="caption" style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>
                        {vehicle.maintenanceCount}
                      </Typography>
                    </View>
                  )}
                </View>
                <Typography variant="body2SemiBold" color="primary" style={{ marginTop: 8 }}>
                  {t('operations.maintenance')}
                </Typography>
              </Pressable>

              <Pressable
                style={[styles.infoCard, { borderColor: colors.border }]}
                onPress={() => {
                  // TODO: navigate to inspections list
                }}
              >
                <View style={styles.infoCardHeader}>
                  <Icon name="clipboard-check" size={24} color="primaryForeground" />
                  {(vehicle.inspectionCount ?? 0) > 0 && (
                    <Typography variant="body2" color="icon" style={{ marginLeft: 'auto' }}>
                      {vehicle.inspectionCount}
                    </Typography>
                  )}
                </View>
                <Typography variant="body2SemiBold" color="primary" style={{ marginTop: 8 }}>
                  {t('operations.inspections')}
                </Typography>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerBtn: {
    minWidth: 80,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroImage: {
    width: SCREEN_WIDTH - 40,
    height: HERO_HEIGHT,
  },
  heroPlaceholder: {
    width: '100%',
    height: HERO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rentedBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rentedBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentedBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  clientAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
