import { useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Icon } from '@/components/ui/Icon';
import { ImageCardView } from '@/components/ui/ImageCardView';
import { Input } from '@/components/ui/Input';
import { type CurrencyCode, MoneyInput, parseMoneyValue } from '@/components/ui/MoneyInput';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type MaintenanceType,
  createVehicleMaintenance,
} from '@/lib/services/vehicleHistoryService';

const maintenanceTypeOptions: SelectOption<MaintenanceType>[] = [
  { value: 'OIL_CHANGE', label: 'Troca de oleo' },
  { value: 'TIRE_PRESSURE', label: 'Calibragem de pneu' },
  { value: 'FILTER_CHANGE', label: 'Troca de filtros' },
  { value: 'BATTERY_CHECK', label: 'Verificacao de bateria' },
  { value: 'OTHER', label: 'Outro' },
];

const currencyOptions: SelectOption<CurrencyCode>[] = [
  { value: 'BRL', label: 'R$ BRL' },
  { value: 'USD', label: '$ USD' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'EUR', label: '€ EUR' },
];

export default function NewVehicleMaintenanceScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('OIL_CHANGE');
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const [amount, setAmount] = useState('');
  const [mileage, setMileage] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!vehicleId) return;
      await createVehicleMaintenance(vehicleId, {
        type: maintenanceType,
        currency,
        amount: parseMoneyValue(amount, currency),
        mileage: mileage ? Number(mileage) : undefined,
        maintenanceDate: maintenanceDate.toISOString(),
        note: note.trim() || undefined,
        receiptPhotoUri,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['vehicle-maintenance', vehicleId],
      });
      router.back();
    },
  });

  const canSubmit = !!vehicleId && parseMoneyValue(amount, currency) > 0;

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <BackButton />
        <Typography variant="h6SemiBold" color="text">
          {t('operations.maintenance')}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Typography variant="body2Medium" color="placeholder">
            {t('operations.maintenanceType')}
          </Typography>
          <Select
            options={maintenanceTypeOptions}
            value={maintenanceType}
            onValueChange={setMaintenanceType}
            placeholder={t('operations.maintenanceType')}
          />
        </View>

        <View style={styles.currencyRow}>
          <View style={styles.currencyCol}>
            <Typography variant="body2Medium" color="placeholder">
              {t('operations.currency')}
            </Typography>
            <Select
              options={currencyOptions}
              value={currency}
              onValueChange={(value) => setCurrency(value as CurrencyCode)}
              placeholder={t('operations.currency')}
            />
          </View>
          <View style={styles.amountCol}>
            <MoneyInput
              value={amount}
              onChangeText={setAmount}
              currency={currency}
              label={t('operations.value')}
              placeholder="0,00"
            />
          </View>
        </View>

        <Input
          value={mileage}
          onChangeText={setMileage}
          keyboardType="number-pad"
          label={t('operations.currentMileage')}
          placeholder=""
        />

        <DatePicker
          value={maintenanceDate}
          onChange={setMaintenanceDate}
          label={t('operations.maintenanceDate')}
          placeholder={t('operations.today')}
        />

        <Pressable
          style={[styles.receiptRow, { borderBottomColor: colors.icon }]}
          onPress={pickImage}
        >
          <Typography variant="body1" color="text">
            {t('operations.addFiscalReceipt')}
          </Typography>
          <Icon name="chevron-right" size={20} color="icon" />
        </Pressable>

        {receiptPhotoUri && (
          <View style={styles.photoWrapper}>
            <ImageCardView
              uri={receiptPhotoUri}
              style={styles.photo}
              onRemove={() => setReceiptPhotoUri(undefined)}
            />
          </View>
        )}

        <Input
          value={note}
          onChangeText={setNote}
          label={t('operations.observation')}
          placeholder={t('operations.writeSomething')}
          multiline
          numberOfLines={4}
          style={styles.noteInput}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="full"
          onPress={() => mutation.mutate()}
          disabled={!canSubmit}
          loading={mutation.isPending}
        >
          {t('common.save')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 120,
  },
  field: {
    gap: 4,
    zIndex: 5,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 4,
  },
  currencyCol: {
    width: 120,
    gap: 4,
  },
  amountCol: {
    flex: 1,
  },
  receiptRow: {
    height: 38,
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoWrapper: {
    alignItems: 'flex-start',
  },
  photo: {
    width: 96,
    aspectRatio: 1,
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
});
