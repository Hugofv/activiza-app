import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { type CurrencyCode, MoneyInput } from '@/components/ui/MoneyInput';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Typography } from '@/components/ui/Typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import type { VehicleSubtype } from '@/lib/services/vehicleService';
import { useEditVehicleStore } from '@/lib/stores/editVehicleStore';

import { useNewVehicleForm } from './_context';

interface VehicleFormFields {
  model: string;
  year: string;
  plate: string;
  value: string;
  mileage: string;
}

const CAR_BRANDS: SelectOption[] = [
  { value: 'BMW', label: 'BMW' },
  { value: 'BYD', label: 'BYD' },
  { value: 'Chevrolet', label: 'Chevrolet' },
  { value: 'Fiat', label: 'Fiat' },
  { value: 'Ford', label: 'Ford' },
  { value: 'Honda', label: 'Honda' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Jeep', label: 'Jeep' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Renault', label: 'Renault' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Other', label: 'Other' },
];

const MOTO_BRANDS: SelectOption[] = [
  { value: 'Honda', label: 'Honda' },
  { value: 'Yamaha', label: 'Yamaha' },
  { value: 'Suzuki', label: 'Suzuki' },
  { value: 'Kawasaki', label: 'Kawasaki' },
  { value: 'BMW', label: 'BMW' },
  { value: 'Ducati', label: 'Ducati' },
  { value: 'Harley-Davidson', label: 'Harley-Davidson' },
  { value: 'Other', label: 'Other' },
];

export default function VehicleFormScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const keyboardHeight = useKeyboardHeight();
  const searchParams = useLocalSearchParams<{ vehicleId?: string; edit?: string }>();
  const isEditMode = !!searchParams.vehicleId && searchParams.edit === '1';
  const { draft, updateDraft } = useEditVehicleStore();
  const { formData, updateFormData, setCurrentStep } = useNewVehicleForm();

  const currencyOptions: SelectOption[] = [
    { value: 'GBP', label: '£ GBP' },
    { value: 'USD', label: '$ USD' },
    { value: 'BRL', label: 'R$ BRL' },
    { value: 'EUR', label: '€ EUR' },
  ];

  const activeSubtype = isEditMode ? (draft.subtype ?? 'CAR') : formData.subtype;
  const activeBrand = isEditMode ? (draft.brand ?? '') : formData.brand;
  const activeCurrency = isEditMode ? (draft.currency ?? 'GBP') : formData.currency;

  const brandOptions = activeSubtype === 'MOTORCYCLE' ? MOTO_BRANDS : CAR_BRANDS;

  const vehicleSchema = yup.object().shape({
    model: yup
      .string()
      .required(
        `${t('operations.vehicleModel')} ${t('common.validation.required')}`
      ),
    year: yup.string().default(''),
    plate: yup
      .string()
      .required(
        `${t('operations.plate')} ${t('common.validation.required')}`
      ),
    value: yup.string().default(''),
    mileage: yup.string().default(''),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VehicleFormFields>({
    resolver: yupResolver(vehicleSchema) as any,
    defaultValues: {
      model: isEditMode ? (draft.model ?? '') : (formData.model || ''),
      year: isEditMode ? (draft.year ?? '') : (formData.year || ''),
      plate: isEditMode ? (draft.plate ?? '') : (formData.plate || ''),
      value: isEditMode ? (draft.value != null ? String(draft.value) : '') : (formData.value || ''),
      mileage: isEditMode ? (draft.mileage ?? '') : (formData.mileage || ''),
    },
    mode: 'onChange',
  });

  const handleTypeChange = (subtype: VehicleSubtype) => {
    if (isEditMode) {
      updateDraft({ subtype, brand: '' });
    } else {
      updateFormData({ subtype, brand: '' });
    }
  };

  const handleBrandChange = (brand: string) => {
    if (isEditMode) {
      updateDraft({ brand });
    } else {
      updateFormData({ brand });
    }
  };

  const handleCurrencyChange = (currency: string) => {
    if (isEditMode) {
      updateDraft({ currency });
    } else {
      updateFormData({ currency });
    }
  };

  const onNext = (data: VehicleFormFields) => {
    if (isEditMode) {
      const parsedValue = data.value
        ? parseFloat(data.value.replace(/\D/g, '')) / 100
        : undefined;
      updateDraft({
        model: data.model,
        year: data.year || undefined,
        plate: data.plate,
        value: parsedValue,
        mileage: data.mileage || undefined,
      });
      router.back();
      return;
    }
    updateFormData({
      model: data.model,
      year: data.year,
      plate: data.plate,
      value: data.value,
      mileage: data.mileage,
    });
    setCurrentStep(1);
    router.push('/vehicles/new/photos' as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle type selector */}
        <View>
          <Typography
            variant="body2Medium"
            style={[styles.fieldLabel, { color: colors.text }]}
          >
            {t('operations.vehicleType')}
          </Typography>
          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeCard,
                {
                  borderColor:
                    activeSubtype === 'CAR' ? colors.primary : colors.border,
                  borderWidth: activeSubtype === 'CAR' ? 2 : 1,
                },
              ]}
              onPress={() => handleTypeChange('CAR')}
            >
              <Icon
                name="car"
                size={36}
                color={activeSubtype === 'CAR' ? 'primaryForeground' : 'icon'}
              />
              <Typography
                variant="body2Medium"
                style={{
                  color:
                    activeSubtype === 'CAR'
                      ? colors.primaryForeground
                      : colors.icon,
                  marginTop: 6,
                }}
              >
                {t('operations.car')}
              </Typography>
            </Pressable>

            <Pressable
              style={[
                styles.typeCard,
                {
                  borderColor:
                    activeSubtype === 'MOTORCYCLE'
                      ? colors.primary
                      : colors.border,
                  borderWidth: activeSubtype === 'MOTORCYCLE' ? 2 : 1,
                },
              ]}
              onPress={() => handleTypeChange('MOTORCYCLE')}
            >
              <Icon
                name="motorbike"
                size={36}
                color={
                  activeSubtype === 'MOTORCYCLE' ? 'primaryForeground' : 'icon'
                }
              />
              <Typography
                variant="body2Medium"
                style={{
                  color:
                    activeSubtype === 'MOTORCYCLE'
                      ? colors.primaryForeground
                      : colors.icon,
                  marginTop: 6,
                }}
              >
                {t('operations.motorcycle')}
              </Typography>
            </Pressable>
          </View>
        </View>

        {/* Brand */}
        <View style={styles.brandField}>
          <Typography
            variant="body2Medium"
            style={[styles.fieldLabel, { color: colors.text }]}
          >
            {t('operations.brand')}
          </Typography>
          <Select
            options={brandOptions}
            value={activeBrand}
            onValueChange={handleBrandChange}
            placeholder={t('operations.brand')}
          />
        </View>

        {/* Model */}
        <Input
          control={control}
          name="model"
          label={t('operations.vehicleModel')}
          placeholder=""
          error={errors.model?.message}
        />

        {/* Year */}
        <Input
          control={control}
          name="year"
          label={t('operations.vehicleYear')}
          placeholder={String(new Date().getFullYear())}
          keyboardType="number-pad"
          maxLength={4}
          error={errors.year?.message}
        />

        {/* Plate */}
        <Input
          control={control}
          name="plate"
          label={t('operations.plate')}
          placeholder=""
          autoCapitalize="characters"
          error={errors.plate?.message}
        />

        {/* Currency + Value */}
        <View style={styles.currencyRow}>
          <View style={styles.currencySelect}>
            <Typography
              variant="body2Medium"
              style={[styles.fieldLabel, { color: colors.text }]}
            >
              {t('operations.currency')}
            </Typography>
            <Select
              options={currencyOptions}
              value={activeCurrency}
              onValueChange={handleCurrencyChange}
            />
          </View>
          <View style={styles.amountInput}>
            <MoneyInput
              control={control}
              name="value"
              label={`${t('operations.value')} (${t('operations.optional')})`}
              placeholder="0,00"
              currency={activeCurrency as CurrencyCode}
              error={errors.value?.message}
            />
          </View>
        </View>

        {/* Mileage */}
        <Input
          control={control}
          name="mileage"
          label={t('operations.currentMileage')}
          placeholder=""
          keyboardType="number-pad"
          error={errors.mileage?.message}
        />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="full"
          onPress={handleSubmit(onNext)}
          disabled={!isValid}
        >
          {isEditMode ? t('common.save') : t('operations.next')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  typeCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandField: {
    gap: 2,
    zIndex: 10,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 5,
  },
  currencySelect: {
    width: 130,
    gap: 1,
  },
  amountInput: { flex: 1 },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
