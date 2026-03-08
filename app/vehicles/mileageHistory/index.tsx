import { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Icon } from '@/components/ui/Icon';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  createVehicleMileageRecord,
  getVehicleMileageHistory,
  groupHistoryByMonth,
} from '@/lib/services/vehicleHistoryService';

function toDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function toMileage(value: number, locale: string) {
  return `${new Intl.NumberFormat(locale).format(value)}km`;
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function VehicleMileageHistoryScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [mileage, setMileage] = useState('');
  const [recordDate, setRecordDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | undefined>();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['vehicle-mileage', vehicleId],
    queryFn: () => getVehicleMileageHistory(vehicleId!),
    enabled: !!vehicleId,
  });

  const groups = useMemo(
    () => groupHistoryByMonth(data ?? [], 'recordDate', i18n.language),
    [data, i18n.language]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!vehicleId) return;
      await createVehicleMileageRecord(vehicleId, {
        mileage: Number(mileage),
        recordDate: recordDate.toISOString(),
        note: note.trim() || undefined,
        receiptPhotoUri,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicle-mileage', vehicleId] });
      setIsBottomSheetOpen(false);
      setMileage('');
      setRecordDate(new Date());
      setNote('');
      setReceiptPhotoUri(undefined);
    },
  });

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('operations.permissionRequired'),
          t('operations.galleryPermissionMessage')
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setReceiptPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(t('common.error'), t('operations.imagePickerError'));
    }
  };

  const handleOpenBottomSheet = () => {
    setRecordDate(new Date());
    setIsBottomSheetOpen(true);
  };

  const canSubmit = !!vehicleId && Number(mileage) > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <BackButton />
        <Button variant="secondary" size="sm" disabled>
          {t('operations.configure')}
        </Button>
      </View>

      <Typography variant="h3Bold" style={styles.title}>
        {t('operations.mileageHistory')}
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
            {t('operations.noMileageRecords')}
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
                  <View style={styles.rowLeft}>
                    <Icon name="gauge" size={18} color="primaryForeground" />
                    <Typography variant="body1SemiBold" color="primaryForeground">
                      {toMileage(record.mileage, i18n.language)}
                    </Typography>
                  </View>
                  <Typography variant="body2" color="placeholder">
                    {toDate(record.recordDate, i18n.language)}
                  </Typography>
                </View>
              ))}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Button variant="primary" size="full" onPress={handleOpenBottomSheet}>
          {t('operations.register')}
        </Button>
      </View>

      <BottomSheet
        visible={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title={t('operations.mileageHistory')}
        minHeight={360}
        maxHeightRatio={0.9}
      >
        <View style={styles.sheetContent}>
          <Typography variant="h6Medium" color="text">
            {t('operations.fiscalReceipt')}
            <Typography variant="body2" color="placeholder">
              {' '}
              {t('operations.optional')}
            </Typography>
          </Typography>

          <Pressable
            style={[
              styles.addPhotoButton,
              {
                borderColor: colors.placeholder,
                backgroundColor: colors.background,
              },
            ]}
            onPress={pickImage}
          >
            <View style={styles.addPhotoContent}>
              <Icon name="photo" size={24} color="primaryForeground" />
              <Typography variant="body1Medium" color="primaryForeground">
                {t('operations.addPhoto')}
              </Typography>
            </View>
          </Pressable>

          {receiptPhotoUri && (
            <ImageCardView
              uri={receiptPhotoUri}
              style={styles.sheetPhoto}
              onRemove={() => setReceiptPhotoUri(undefined)}
            />
          )}

          <Input
            value={mileage}
            onChangeText={setMileage}
            keyboardType="number-pad"
            label={t('operations.currentMileage')}
            placeholder=""
          />

          <DatePicker
            value={recordDate}
            onChange={setRecordDate}
            label={t('operations.mileageDate')}
            placeholder={t('operations.today')}
          />

          <Input
            value={note}
            onChangeText={setNote}
            label={t('operations.observation')}
            placeholder={t('operations.writeSomething')}
            multiline
            numberOfLines={3}
            style={styles.noteInput}
          />

          <Button
            variant="primary"
            size="default"
            onPress={() => mutation.mutate()}
            disabled={!canSubmit}
            loading={mutation.isPending}
            style={styles.saveButton}
          >
            {t('common.save')}
          </Button>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderBottomWidth: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
  sheetContent: {
    gap: 14,
    paddingBottom: 12,
  },
  addPhotoButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
  },
  addPhotoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetPhoto: {
    width: 72,
    aspectRatio: 1,
  },
  noteInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  saveButton: {
    alignSelf: 'flex-end',
    minWidth: 120,
  },
});
